import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { CustomerContext } from '@kix/core/dist/browser/customer';
import { ContextMode, KIXObjectType } from '@kix/core/dist/model';

export class CustomerMainMenuExtension implements IMainMenuExtension {

    public link: string = "/" + CustomerContext.CONTEXT_ID;

    public icon: string = "customers";

    public text: string = "Kunden";

    public contextId: string = CustomerContext.CONTEXT_ID;

    public contextMode: ContextMode = ContextMode.DASHBOARD;

    public KIXObjectType: KIXObjectType = KIXObjectType.CUSTOMER;
}

module.exports = (data, host, options) => {
    return new CustomerMainMenuExtension();
};
