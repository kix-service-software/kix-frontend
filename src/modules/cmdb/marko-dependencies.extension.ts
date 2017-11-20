import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class CMDBMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/cmdb"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new CMDBMarkoDependencyExtension();
};
