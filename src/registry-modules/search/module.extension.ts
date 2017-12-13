import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

export class SearchModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "search";
    }

    public getDefaultConfiguration(): any {
        const content = {};
        return content;
    }

}

module.exports = (data, host, options) => {
    return new SearchModuleFactoryExtension();
};
