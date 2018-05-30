import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    CustomerContextConfiguration, CustomerDetialsContextConfiguration, CustomerDetailsContext
} from '@kix/core/dist/browser/customer';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, CustomerProperty, WidgetSize, ContactProperty
} from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';

export class ModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return CustomerDetailsContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new CustomerDetialsContextConfiguration(this.getModuleId(), [], [], [], [], [], [], [], [], [], [], []);
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
