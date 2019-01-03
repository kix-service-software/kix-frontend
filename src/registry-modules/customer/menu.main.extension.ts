import { IMainMenuExtension } from '../../core/extensions';
import { CustomerContext, CustomerDetailsContext } from '../../core/browser/customer';
import { ContactDetailsContext } from '../../core/browser/contact';

export class CustomerMainMenuExtension implements IMainMenuExtension {

    public mainContextId: string = CustomerContext.CONTEXT_ID;

    public contextIds: string[] = [
        CustomerContext.CONTEXT_ID, CustomerDetailsContext.CONTEXT_ID, ContactDetailsContext.CONTEXT_ID
    ];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-customers";

    public text: string = "Kunden";


}

module.exports = (data, host, options) => {
    return new CustomerMainMenuExtension();
};
