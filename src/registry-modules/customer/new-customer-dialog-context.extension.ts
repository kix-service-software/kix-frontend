import { ContextConfiguration } from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { NewCustomerDialogContextConfiguration, NewCustomerDialogContext } from "@kix/core/dist/browser/customer";

export class NewCustomerDialogModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewCustomerDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new NewCustomerDialogContextConfiguration();
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new NewCustomerDialogModuleExtension();
};
