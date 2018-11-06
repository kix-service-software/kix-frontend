import { GeneralCatalogItem, Ticket } from '@kix/core/dist/model';
import { DynamicField } from '@kix/core/dist/model/kix/dynamic-field/DynamicField';

export class ComponentState {

    public constructor(
        public ticket: Ticket = null,
        public ticketDynamicFields: DynamicField[] = [],
        public dynamicFields: DynamicField[] = [],
        public displayGroups: GeneralCatalogItem[] = [],
    ) { }
}
