import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class SearchTemplatesWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/search-templates"
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['search-templates', 'widgets/search-templates']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new SearchTemplatesWidgetMarkoDependencyExtension();
};
