import { WidgetConfiguration } from '@kix/core/dist/model';
import { DynamicFieldsSettings } from './DynamicFieldsSettings';
import { DynamicField } from '@kix/core/dist/model/ticket/DynamicField';

export class DynamicFieldWidgetComponentState {

    public constructor(
        public instanceId: string = null,
        public ticketId: number = null,
        public widgetConfiguration: WidgetConfiguration<DynamicFieldsSettings> = null,
        public configuredDynamicFields: number[] = [],
        public filteredDynamicFields: DynamicField[] = [],
        public dynamicFields: DynamicField[] = []
    ) { }

}
