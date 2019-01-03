import { GeneralCatalogItem, Ticket } from '../../../core/model';
import { DynamicField } from '../../../core/model/kix/dynamic-field/DynamicField';

export class ComponentState {

    public constructor(
        public ticket: Ticket = null,
        public ticketDynamicFields: DynamicField[] = [],
        public dynamicFields: DynamicField[] = [],
        public displayGroups: GeneralCatalogItem[] = [],
    ) { }
}
