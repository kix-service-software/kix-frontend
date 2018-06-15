import { GeneralCatalogItem, Ticket } from '@kix/core/dist/model';
import { DynamicField } from '@kix/core/dist/model/kix/dynamic-field/DynamicField';
import { DynamicField as TicketDynamicField } from '@kix/core/dist/model/kix/ticket/DynamicField';

export class DynamicFieldContainerComponentState {

    public constructor(
        public ticket: Ticket = null,
        public ticketDynamicFields: TicketDynamicField[] = [],
        public dynamicFields: DynamicField[] = [],
        public displayGroups: GeneralCatalogItem[] = [],
    ) { }
}
