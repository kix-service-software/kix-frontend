import { ContainerConfiguration, ContainerRow, IModuleFactoryExtension } from '@kix/core';

export class SearchModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/search/';
    }

    public getModuleId(): string {
        return "search-dashboard";
    }

    public getDefaultConfiguration(): any {
        const content = new ContainerConfiguration();
        return content;
    }

}

module.exports = (data, host, options) => {
    return new SearchModuleFactoryExtension();
};
