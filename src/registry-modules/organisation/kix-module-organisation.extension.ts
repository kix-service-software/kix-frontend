import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

    public initComponentId: string = 'organisation-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['organisation-module-component', 'organisation/organisation-module-component'],
        ['organisations', 'organisation/organisation-module'],
        ['organisation-assigned-contacts-widget', 'organisation/widgets/organisation-assigned-contacts-widget'],
        ['organisation-assigned-tickets-widget', 'organisation/widgets/organisation-assigned-tickets-widget'],
        ['new-organisation-dialog', 'organisation/dialogs/new-organisation-dialog'],
        ['edit-organisation-dialog', 'organisation/dialogs/edit-organisation-dialog'],
        ['search-organisation-dialog', 'organisation/dialogs/search-organisation-dialog']
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
