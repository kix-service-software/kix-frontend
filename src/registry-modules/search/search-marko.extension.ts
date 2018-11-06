import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class MarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'search/search-module',
            'search/widgets/search-result-explorer'

        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['search', 'search/search-module'],
            ['search-result-explorer', 'search/widgets/search-result-explorer']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new MarkoDependencyExtension();
};
