import { IMarkoDependencyExtension } from './../../../extensions/IMarkoDependencyExtension';

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
