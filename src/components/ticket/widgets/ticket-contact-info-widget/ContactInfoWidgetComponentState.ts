import { Contact, WidgetConfiguration } from '@kix/core/dist/model';

export class ContactInfoWidgetComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contact: Contact = null
    ) { }

}
