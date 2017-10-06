import { ContainerConfiguration, ContainerRow, IModuleFactoryExtension } from '@kix/core';

export class CMDBModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/cmdb/';
    }

    public getModuleId(): string {
        return "cmdb-dashboard";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();
        return content;
    }

}

module.exports = (data, host, options) => {
    return new CMDBModuleFactoryExtension();
};
