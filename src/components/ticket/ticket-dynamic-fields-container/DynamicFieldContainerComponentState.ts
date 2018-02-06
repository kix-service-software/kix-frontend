import { GeneralCatalogItem } from '@kix/core/dist/model';
import { DynamicField as TicketDynamicField } from '@kix/core/dist/model/ticket/DynamicField';
import { DynamicField } from '@kix/core/dist/model/dynamic-field/DynamicField';

export class DynamicFieldContainerComponentState {

    public constructor(
        public ticketId: number = null,
        public ticketDynamicFields: TicketDynamicField[] = [],
        public dynamicFields: DynamicField[] = [],
        public displayGroups: GeneralCatalogItem[] = [],
    ) { }
}
