import { IMainMenuExtension } from '../../core/extensions';
import { ContactDetailsContext } from '../../core/browser/contact';
import { OrganisationContext, OrganisationDetailsContext } from '../../core/browser/organisation';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { CRUD } from '../../core/model';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = OrganisationContext.CONTEXT_ID;

    public contextIds: string[] = [
        OrganisationContext.CONTEXT_ID, OrganisationDetailsContext.CONTEXT_ID, ContactDetailsContext.CONTEXT_ID
    ];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-organisation";

    public text: string = "Translatable#Organisations";

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('organisations', [CRUD.READ]),
        new UIComponentPermission('contacts', [CRUD.READ], true)
    ];

    public orderRang: number = 300;

}

module.exports = (data, host, options) => {
    return new Extension();
};
