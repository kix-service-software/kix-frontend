import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class SearchMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/search"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new SearchMarkoDependencyExtension();
};
