import { AbstractAction, WidgetComponentState } from '@kix/core/dist/model';
import { DynamicField } from '@kix/core/dist/model/kix/ticket/DynamicField';

import { DynamicFieldsSettings } from './DynamicFieldsSettings';

export class DynamicFieldWidgetComponentState extends WidgetComponentState<DynamicFieldsSettings> {

    public ticketId: number = null;
    public configuredDynamicFields: number[] = [];
    public filteredDynamicFields: DynamicField[] = [];
    public dynamicFields: DynamicField[] = [];
    public actions: AbstractAction[] = [];

}
