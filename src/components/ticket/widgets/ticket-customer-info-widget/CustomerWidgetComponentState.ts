import { Customer, WidgetConfiguration, ContextType } from '@kix/core/dist/model';

export class CustomerWidgetComponentState {

    public constructor(
        public instanceId: string = null,
        public customer: Customer = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contextType: ContextType = null
    ) { }

}
