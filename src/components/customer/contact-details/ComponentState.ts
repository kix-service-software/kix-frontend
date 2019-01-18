import { ConfiguredWidget, AbstractAction, Contact } from "../../../core/model";
import { ContactDetailsContextConfiguration } from "../../../core/browser/contact";

export class ComponentState {

    public constructor(
        public instanceId: string = '20180710-contact-details',
        public contact: Contact = null,
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public generalActions: AbstractAction[] = [],
        public contactActions: AbstractAction[] = [],
        public loadingContact: boolean = true,
        public configuration: ContactDetailsContextConfiguration = null,
        public error: any = null,
        public title: string = ''
    ) { }

}
