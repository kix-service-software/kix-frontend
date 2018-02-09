import { WidgetConfiguration } from '@kix/core/dist/model';
import { DynamicFieldsSettings } from './DynamicFieldsSettings';
import { DynamicField } from '@kix/core/dist/model/ticket/DynamicField';
import { WidgetComponentState } from '@kix/core/dist/browser/model';

export class DynamicFieldWidgetComponentState extends WidgetComponentState<DynamicFieldsSettings> {

    public ticketId: number = null;
    public configuredDynamicFields: number[] = [];
    public filteredDynamicFields: DynamicField[] = [];
    public dynamicFields: DynamicField[] = [];

}
