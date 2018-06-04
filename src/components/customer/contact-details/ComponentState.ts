import { ConfiguredWidget, AbstractAction, Contact } from "@kix/core/dist/model";
import { ContactDetailsContextConfiguration } from "@kix/core/dist/browser/contact";

export class ComponentState {

    public constructor(
        public contactId: string = null,
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public generalActions: AbstractAction[] = [],
        public contactActions: AbstractAction[] = [],
        public loadingContact: boolean = true,
        public loadingConfig: boolean = true,
        public configuration: ContactDetailsContextConfiguration = null,
        public contact: Contact = null
    ) { }

}
