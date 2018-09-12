import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { CustomerContext, CustomerDetailsContext } from '@kix/core/dist/browser/customer';
import { ContactDetailsContext } from '@kix/core/dist/browser/contact';

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
