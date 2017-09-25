import { UserListConfiguration } from './../../../components/widgets/user-list/model/UserListConfiguration';
import { IWidget } from '@kix/core';

export class UserListWidget implements IWidget {

    public id: string;

    public instanceId: string = Date.now().toString();

    public template: string = null;

    public configurationTemplate: string = "widgets/user-list/configuration";

    public title: string = "User Liste";

    public isExternal: boolean = false;

    public constructor(id: string) {
        this.id = id;
    }

}
