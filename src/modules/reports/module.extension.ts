import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContainerConfiguration } from '@kix/core/dist/model/draggable-container/ContainerConfiguration';

export class ReportsModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/reports/';
    }

    public getModuleId(): string {
        return "reports";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();
        return content;
    }

}

module.exports = (data, host, options) => {
    return new ReportsModuleFactoryExtension();
};
