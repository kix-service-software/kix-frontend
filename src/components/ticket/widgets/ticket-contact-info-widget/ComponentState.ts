import { Contact, WidgetConfiguration, ContextType } from '@kix/core/dist/model';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contactId: string = null,
        public contextType: ContextType = null
    ) { }

}
