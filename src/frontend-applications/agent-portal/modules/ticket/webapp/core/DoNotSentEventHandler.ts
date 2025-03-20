/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BackendNotification } from '../../../../model/BackendNotification';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { DateTimeUtil } from '../../../base-components/webapp/core/DateTimeUtil';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../base-components/webapp/core/IEventSubscriber';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { PortalNotification } from '../../../portal-notification/model/PortalNotification';
import { PortalNotificationType } from '../../../portal-notification/model/PortalNotificationType';
import { PortalNotificationService } from '../../../portal-notification/webapp/core/PortalNotificationService';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { AgentSocketClient } from '../../../user/webapp/core/AgentSocketClient';
import { Ticket } from '../../model/Ticket';
import { TicketUIEvent } from '../../model/TicketUIEvent';
import { TicketDetailsContext } from './context';

export class DoNotSentEventHandler {

    private static INSTANCE: DoNotSentEventHandler;

    public static getInstance(): DoNotSentEventHandler {
        if (!DoNotSentEventHandler.INSTANCE) {
            DoNotSentEventHandler.INSTANCE = new DoNotSentEventHandler();
        }
        return DoNotSentEventHandler.INSTANCE;
    }

    private subscriber: IEventSubscriber;

    private constructor() {

        this.subscriber = {
            eventSubscriberId: 'TicketNotificationHandler',
            eventPublished: (data: BackendNotification): void => {
                if (data instanceof BackendNotification && data.Namespace === 'Ticket.Article.Flag') {
                    this.checkForNotSentError(data);
                }
            }
        };

        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_CREATED, this.subscriber);
    }

    private async checkForNotSentError(backendNotification: BackendNotification): Promise<void> {
        const split = backendNotification?.ObjectID?.split('::') || [];
        if (split.length === 4 && split[2] === 'NotSentError') {
            const currentUser = await AgentSocketClient.getInstance().getCurrentUser()
                .catch(() => null);
            if (currentUser?.UserID === backendNotification.UserID) {
                const message = await TranslationService.translate('Translatable#Email could not be sent');
                const notSentErrorNotification = new PortalNotification(
                    'NotSentError', 'Translatable#Email Error', PortalNotificationType.IMPORTANT,
                    message, DateTimeUtil.getKIXDateTimeString(new Date())
                );

                const ticket = await this.loadTicket(Number(split[0]));
                const ticketString = await LabelService.getInstance().getObjectText(ticket);

                notSentErrorNotification.teaserText = ticketString;

                notSentErrorNotification.data = {
                    ticketId: Number(split[0]),
                    articleId: Number(split[1])
                };

                notSentErrorNotification.callback = (notification: PortalNotification): void => {
                    this.setTicketContext(notification);
                };

                PortalNotificationService.getInstance().publishNotifications([notSentErrorNotification]);
            }
        }
    }

    private async loadTicket(ticketId: number): Promise<Ticket> {
        const tickets = await KIXObjectService.loadObjects<Ticket>(KIXObjectType.TICKET, [ticketId])
            .catch(() => []);
        return tickets?.length ? tickets[0] : null;
    }

    private async setTicketContext(notification: PortalNotification): Promise<void> {
        const ticketId = notification?.data?.ticketId;
        const articleId = notification?.data?.articleId;

        if (ticketId) {
            await ContextService.getInstance().setActiveContext(TicketDetailsContext.CONTEXT_ID, ticketId);

            setTimeout(() => {
                EventService.getInstance().publish(
                    TicketUIEvent.SCROLL_TO_ARTICLE, { articleId }
                );
            }, 2000);
        }
    }

}