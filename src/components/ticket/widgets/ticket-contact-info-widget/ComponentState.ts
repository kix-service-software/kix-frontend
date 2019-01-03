import { Contact, WidgetConfiguration, ContextType } from '../../../../core/model';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contactId: string = null,
        public contextType: ContextType = null,
        public groups: string[] = null
    ) { }

}
