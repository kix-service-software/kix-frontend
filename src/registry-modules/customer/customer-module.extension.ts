import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    NewCustomerDialogContext, CustomerContext, CustomerContextConfiguration
} from '@kix/core/dist/browser/customer';
import { ContextConfiguration } from '@kix/core/dist/model';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return CustomerContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new CustomerContextConfiguration(this.getModuleId(), [], [], [], [], [], []);
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
