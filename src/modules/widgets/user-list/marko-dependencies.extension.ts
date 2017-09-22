import { IMarkoDependencyExtension } from '@kix/core';

export class UserListWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/user-list",
            "widgets/user-list/configuration"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new UserListWidgetMarkoDependencyExtension();
};
