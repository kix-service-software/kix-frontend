import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

export class CustomerModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/customer/';
    }

    public getModuleId(): string {
        return "customer-dashboard";
    }

    public getDefaultConfiguration(): any {
        const content = {};
        return content;
    }

}

module.exports = (data, host, options) => {
    return new CustomerModuleFactoryExtension();
};
