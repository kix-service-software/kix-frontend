import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

    public initComponentId: string = 'contact-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['contact-module-component', 'organisation/contact-module-component'],
        ['contact-assigned-organisations-widget', 'organisation/widgets/contact-assigned-organisations-widget'],
        ['contact-assigned-tickets-widget', 'organisation/widgets/contact-assigned-tickets-widget'],
        ['new-contact-dialog', 'organisation/dialogs/new-contact-dialog'],
        ['edit-contact-dialog', 'organisation/dialogs/edit-contact-dialog'],
        ['search-contact-dialog', 'organisation/dialogs/search-contact-dialog'],
        ['contact-input-organisation', 'organisation/dialogs/inputs/contact-input-organisation'],
        ['create-new-ticket-cell', 'organisation/table/create-new-ticket-cell']
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
