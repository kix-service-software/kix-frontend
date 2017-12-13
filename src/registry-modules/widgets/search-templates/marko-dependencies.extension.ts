import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class SearchTemplatesWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'widgets/search-templates',
            'widgets/search-templates/search-templates-configuration'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['search-templates-widget', 'widgets/search-templates'],
            ['search-templates-configuration', 'widgets/search-templates/search-templates-configuration']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new SearchTemplatesWidgetMarkoDependencyExtension();
};
