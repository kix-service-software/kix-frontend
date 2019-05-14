import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class Extension implements IKIXModuleExtension {

    public id: string = 'contact-module';

    public tags: Array<[string, string]>;

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('contact-module-component', 'organisation/contact-module-component', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'contact-assigned-organisations-widget', 'organisation/widgets/contact-assigned-organisations-widget', []
        ),
        new UIComponent('contact-assigned-tickets-widget', 'organisation/widgets/contact-assigned-tickets-widget', []),
        new UIComponent('new-contact-dialog', 'organisation/dialogs/new-contact-dialog', []),
        new UIComponent('edit-contact-dialog', 'organisation/dialogs/edit-contact-dialog', []),
        new UIComponent('search-contact-dialog', 'organisation/dialogs/search-contact-dialog', []),
        new UIComponent('contact-input-organisation', 'organisation/dialogs/inputs/contact-input-organisation', []),
        new UIComponent('create-new-ticket-cell', 'organisation/table/create-new-ticket-cell', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
