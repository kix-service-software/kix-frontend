import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class MarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'search/search-module'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['search', 'search/search-module']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new MarkoDependencyExtension();
};
