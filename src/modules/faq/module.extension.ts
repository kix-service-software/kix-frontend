import { ContainerConfiguration, ContainerRow, IModuleFactoryExtension } from '@kix/core';

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
