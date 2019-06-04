import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { CRUD } from "../../core/model";

class Extension implements IKIXModuleExtension {

    public id: string = 'organisation-module';

    public external: boolean = false;

    public tags: Array<[string, string]>;

    public initComponents: UIComponent[] = [
        new UIComponent(
            'organisation-read-module-component', 'organisation/module/organisation-read-module-component',
            [new UIComponentPermission('organisations', [CRUD.READ])]
        ),
        new UIComponent(
            'organisation-edit-module-component', 'organisation/module/organisation-edit-module-component',
            [
                new UIComponentPermission('organisations', [CRUD.CREATE]),
                new UIComponentPermission('organisations/*', [CRUD.UPDATE])
            ]
        )
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
