import { AbstractAction, WidgetComponentState, Ticket, DynamicField } from '@kix/core/dist/model';

import { DynamicFieldsSettings } from './DynamicFieldsSettings';

export class ComponentState extends WidgetComponentState<DynamicFieldsSettings> {

    public constructor(
        public ticketId: number = null,
        public configuredDynamicFields: number[] = [],
        public filteredDynamicFields: DynamicField[] = [],
        public dynamicFields: DynamicField[] = [],
        public actions: AbstractAction[] = [],
        public ticket: Ticket = null
    ) {
        super();
    }

}
