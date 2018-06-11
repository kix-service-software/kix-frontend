import { AbstractAction, WidgetComponentState, Ticket } from '@kix/core/dist/model';
import { DynamicField } from '@kix/core/dist/model/kix/ticket/DynamicField';

import { DynamicFieldsSettings } from './DynamicFieldsSettings';

export class DynamicFieldWidgetComponentState extends WidgetComponentState<DynamicFieldsSettings> {

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
