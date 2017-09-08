import { IMarkoDependencyExtension } from './../../../extensions/IMarkoDependencyExtension';

export class SearchTemplatesWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/search-templates",
            "widgets/search-templates/configuration"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new SearchTemplatesWidgetMarkoDependencyExtension();
};
