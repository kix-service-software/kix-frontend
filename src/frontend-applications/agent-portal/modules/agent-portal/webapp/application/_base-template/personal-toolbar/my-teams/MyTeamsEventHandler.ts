import { BackendNotification } from '../../../../../../../model/BackendNotification';
import { BackendNotificationEvent } from '../../../../../../../model/BackendNotificationEvent';
import { IdService } from '../../../../../../../model/IdService';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { ApplicationEvent } from '../../../../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../../base-components/webapp/core/IEventSubscriber';
import { KIXObjectService } from '../../../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../../../base-components/webapp/core/LabelService';
import { Queue } from '../../../../../../ticket/model/Queue';
import { QueueService } from '../../../../../../ticket/webapp/core';
import { TicketStateRepository } from '../../../../../../ticket/webapp/core/TicketStateRepository';
import { AgentService } from '../../../../../../user/webapp/core/AgentService';
import { QueueInformation } from './QueueInformation';

export class MyTeamsEventHandler {

    private eventSubscriberId: string = IdService.generateDateBasedId();
    private ticketStatsLoadTimeout: any;
    private queueInformation: QueueInformation[] = [];
    private updatesEnabled: boolean = false;

    public constructor(
        private queueInformationCallback: (queueInformation: QueueInformation[]) => void
    ) {
        const eventSubscriber: IEventSubscriber = {
            eventSubscriberId: this.eventSubscriberId,
            eventPublished: this.eventPublished.bind(this)
        };

        const events = [
            ApplicationEvent.OBJECT_CREATED,
            ApplicationEvent.OBJECT_UPDATED,
            ApplicationEvent.OBJECT_DELETED
        ];

        for (const event of events) {
            EventService.getInstance().subscribe(event, eventSubscriber);
        }
    }

    public destroy(): void {
        EventService.getInstance().unsubscribeSubscriber(this.eventSubscriberId);
    }

    public init(): void {
        this.loadQueueInformation();
    }

    private async eventPublished(event: BackendNotification): Promise<void> {
        if (!(event instanceof BackendNotification)) {
            return;
        }

        let updated = this.checkMyQueuesPreferenceUpdate(event);

        if (!this.updatesEnabled) {
            return;
        }

        if (!updated) {
            updated = this.checkTicketQueueUpdate(event);
        }

        if (!updated) {
            updated = this.checkTicketCreateOrDelete(event);
        }

        if (!updated) {
            this.checkTicketStateUpdated(event);
        }
    }

    private checkMyQueuesPreferenceUpdate(event: BackendNotification): boolean {
        let updated = false;

        const isPreferenceUpdate = event.Namespace === 'User.UserPreference';
        const isMyQueuesAffected = event.ObjectID?.toString().endsWith('::MyQueues');

        if (isPreferenceUpdate && isMyQueuesAffected) {
            const isUserAffected = event.ObjectID?.startsWith(`${AgentService.getInstance().userId}::`);

            if (isUserAffected) {
                this.loadQueueInformation();
                updated = true;
            }
        }

        return updated;
    }

    private checkTicketStateUpdated(event: BackendNotification): boolean {
        let isUpdated = event.Namespace === 'Ticket.State';

        if (isUpdated) {
            const ids = event.ObjectID?.split('::');
            const oldStateId = Number(ids?.[1]);
            const newStateId = Number(ids?.[2]);
            const oldIsOpenState = TicketStateRepository.getInstance().isOpenState(oldStateId);
            const newIsOpenState = TicketStateRepository.getInstance().isOpenState(newStateId);
            isUpdated = (oldIsOpenState !== newIsOpenState);
            if (isUpdated) {
                this.loadTicketStats();
            }
        }

        return isUpdated;
    }

    private checkTicketCreateOrDelete(event: BackendNotification): boolean {
        const isTicketEvent = event.Namespace === 'Ticket';
        const isCreateOrDeleteEvent = event.Event === BackendNotificationEvent.CREATE
            || event.Event === BackendNotificationEvent.DELETE;

        let updated = false;
        if (isTicketEvent && isCreateOrDeleteEvent) {
            this.loadTicketStats();
            updated = true;
        }

        return updated;
    }

    private checkTicketQueueUpdate(event: BackendNotification): boolean {
        const isUpdateEvent = event.Event === BackendNotificationEvent.UPDATE;
        const isTicketQueueEvent = event.Namespace === 'Ticket.Queue';

        let updated = false;
        if (isUpdateEvent && isTicketQueueEvent) {
            const ids = event.ObjectID?.split('::');
            const oldQueueId = Number(ids?.[1]);
            const newQueueId = Number(ids?.[2]);

            const user = AgentService.getInstance().currentUser;
            if (user.getMyQueueIds().some((q) => q === oldQueueId || q === newQueueId)) {
                updated = true;
                this.loadTicketStats();
            }
        }

        return updated;
    }

    private async loadQueueInformation(): Promise<void> {
        await AgentService.getInstance().getCurrentUser();
        const myQueueIds = AgentService.getInstance().currentUser.getMyQueueIds();
        this.queueInformation = [];
        if (myQueueIds.length) {
            this.updatesEnabled = true;
            const queues = await KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE, myQueueIds)
                .catch((): Queue[] => []);

            for (const queue of queues) {
                const name = await LabelService.getInstance().getObjectText(queue);
                const icon = LabelService.getInstance().getObjectIcon(queue);

                const queueInfo = new QueueInformation(queue.QueueID, name, icon, 0);
                this.queueInformation.push(queueInfo);
            }

            await this.loadTicketStats();
        } else {
            this.updatesEnabled = false;
        }
    }

    private async loadTicketStats(): Promise<void> {
        if (!AgentService.getInstance().currentUser.getMyQueueIds()?.length) {
            this.updatesEnabled = false;

            return;
        }

        if (this.ticketStatsLoadTimeout) {
            clearTimeout(this.ticketStatsLoadTimeout);
        }

        this.ticketStatsLoadTimeout = setTimeout(async function (): Promise<void> {
            const ticketStats = await QueueService.loadTicketStats(this.queueInformation.map((qi) => qi.queueId));

            for (const ts of ticketStats) {
                const queueInfo = this.queueInformation.find((q) => q.queueId === ts.QueueID);
                if (queueInfo) {
                    queueInfo.ticketCount = ts.TotalCount;
                }
            }

            if (this.queueInformationCallback) {
                this.queueInformationCallback(this.queueInformation);
            }
        }.bind(this), 2000);
    }



}