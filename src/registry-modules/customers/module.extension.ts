import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

export class CustomerModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "customers";
    }

    public getDefaultConfiguration(): any {
        const content = {};
        return content;
    }

}

module.exports = (data, host, options) => {
    return new CustomerModuleFactoryExtension();
};
