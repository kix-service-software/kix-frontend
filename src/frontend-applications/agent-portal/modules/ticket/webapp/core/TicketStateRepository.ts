import { IEventDateObject } from 'tui-calendar';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { SysConfigService } from '../../../sysconfig/webapp/core';
import { TicketState } from '../../model/TicketState';
import { TicketStateProperty } from '../../model/TicketStateProperty';
import { IEventSubscriber } from '../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../model/IdService';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { BackendNotification } from '../../../../model/BackendNotification';

export class TicketStateRepository {

    private static INSTANCE: TicketStateRepository;

    public static getInstance(): TicketStateRepository {
        if (!TicketStateRepository.INSTANCE) {
            TicketStateRepository.INSTANCE = new TicketStateRepository();
        }
        return TicketStateRepository.INSTANCE;
    }

    private constructor() { }

    private states: TicketState[] = [];
    private subscriber: IEventSubscriber;

    public async init(): Promise<void> {
        await this.loadOpenStates();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: this.eventPublished.bind(this)
        };

        const events = [
            ApplicationEvent.OBJECT_CREATED,
            ApplicationEvent.OBJECT_UPDATED,
            ApplicationEvent.OBJECT_DELETED
        ];

        for (const event of events) {
            EventService.getInstance().subscribe(event, this.subscriber);
        }
    }

    private eventPublished(event: any): void {
        if (!(event instanceof BackendNotification)) {
            return;
        }

        const viewableStateTypesChanged = event.Namespace === 'SysConfigOption'
            && event.ObjectID === 'Ticket::ViewableStateType';
        const stateChanged = event.Namespace === 'State';

        if (stateChanged || viewableStateTypesChanged) {
            this.loadOpenStates();
        }
    }

    private async loadOpenStates(): Promise<void> {
        const stateTypes = await SysConfigService.getInstance().getTicketViewableStateTypes();

        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.filter = [
            new FilterCriteria(
                TicketStateProperty.TYPE_NAME, SearchOperator.IN,
                FilterDataType.STRING, FilterType.AND, stateTypes
            )
        ];
        this.states = await KIXObjectService.loadObjects<TicketState>(
            KIXObjectType.TICKET_STATE, null, loadingOptions
        ).catch((): TicketState[] => []);
    }

    public isOpenState(stateId: number): boolean {
        return this.states?.some((s) => s.ID === stateId);
    }

}