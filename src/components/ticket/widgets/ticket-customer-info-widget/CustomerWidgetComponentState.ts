import { Customer, WidgetConfiguration } from '@kix/core/dist/model';

export class CustomerWidgetComponentState {

    public constructor(
        public instanceId: string = null,
        public customer: Customer = null,
        public widgetConfiguration: WidgetConfiguration = null
    ) { }

}
