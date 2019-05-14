import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class Extension implements IKIXModuleExtension {

    public id: string;

    public external: boolean = false;

    public tags: Array<[string, string]>;

    public initComponents: UIComponent[] = [
        new UIComponent('organisation-module-component', 'organisation/organisation-module-component', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('organisations', 'organisation/organisation-module', []),
        new UIComponent(
            'organisation-assigned-contacts-widget', 'organisation/widgets/organisation-assigned-contacts-widget', []
        ),
        new UIComponent(
            'organisation-assigned-tickets-widget', 'organisation/widgets/organisation-assigned-tickets-widget', []
        ),
        new UIComponent('new-organisation-dialog', 'organisation/dialogs/new-organisation-dialog', []),
        new UIComponent('edit-organisation-dialog', 'organisation/dialogs/edit-organisation-dialog', []),
        new UIComponent('search-organisation-dialog', 'organisation/dialogs/search-organisation-dialog', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
