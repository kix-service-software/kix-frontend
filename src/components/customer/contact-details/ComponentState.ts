import { ConfiguredWidget, AbstractAction, Contact } from "@kix/core/dist/model";
import { ContactDetailsContextConfiguration } from "@kix/core/dist/browser/contact";

export class ComponentState {

    public constructor(
        public instanceId: string = '20180710-contact-details',
        public contactId: string = null,
        public contact: Contact = null,
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public generalActions: AbstractAction[] = [],
        public contactActions: AbstractAction[] = [],
        public loadingContact: boolean = true,
        public configuration: ContactDetailsContextConfiguration = null
    ) { }

}
