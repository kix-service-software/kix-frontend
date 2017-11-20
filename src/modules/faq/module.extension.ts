import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ContainerConfiguration } from '@kix/core/dist/model/draggable-container/ContainerConfiguration';

export class FAQModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/faq/';
    }

    public getModuleId(): string {
        return "faq-dashboard";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();
        return content;
    }

}

module.exports = (data, host, options) => {
    return new FAQModuleFactoryExtension();
};
