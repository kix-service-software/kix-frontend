import { UserListConfiguration } from './../../../components/widgets/user-list/model/UserListConfiguration';
import { IWidget } from '@kix/core';

export class UserListWidget implements IWidget {

    public id: string;

    public instanceId: string = Date.now().toString();

    public constructor(id: string) {
        this.id = id;
    }

}
