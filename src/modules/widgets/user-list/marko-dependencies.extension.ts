import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class UserListWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/user-list"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new UserListWidgetMarkoDependencyExtension();
};
