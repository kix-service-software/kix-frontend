import { ContainerConfiguration, ContainerRow, IModuleFactoryExtension } from '@kix/core';

export class ServicesModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/services/';
    }

    public getModuleId(): string {
        return "services-dashboard";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();
        return content;
    }

}

module.exports = (data, host, options) => {
    return new ServicesModuleFactoryExtension();
};
