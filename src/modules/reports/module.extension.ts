import { ContainerConfiguration, ContainerRow, IModuleFactoryExtension } from '@kix/core';

export class ReportsModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/reports/';
    }

    public getModuleId(): string {
        return "reports-dashboard";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();
        return content;
    }

}

module.exports = (data, host, options) => {
    return new ReportsModuleFactoryExtension();
};
