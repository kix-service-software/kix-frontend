import { Customer, WidgetConfiguration, ContextType } from '@kix/core/dist/model';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contextType: ContextType = null,
        public customerId: string = null
    ) { }

}
