import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class ReleaseMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'release/release-module'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['release', 'release/release-module']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new ReleaseMarkoDependencyExtension();
};
