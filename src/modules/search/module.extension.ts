import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

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
        const content = {};
        return content;
    }

}

module.exports = (data, host, options) => {
    return new SearchModuleFactoryExtension();
};
