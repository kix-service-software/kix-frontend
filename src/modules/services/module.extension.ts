import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContainerConfiguration } from '@kix/core/dist/model/draggable-container/ContainerConfiguration';

export class ServicesModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/services/';
    }

    public getModuleId(): string {
        return "services";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();
        return content;
    }

}

module.exports = (data, host, options) => {
    return new ServicesModuleFactoryExtension();
};
