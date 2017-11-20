import { UserListConfiguration } from './../../../components/widgets/user-list/model/UserListConfiguration';
import { IWidget } from '@kix/core/dist/model';

export class UserListWidget implements IWidget {

    public id: string;

    public instanceId: string = Date.now().toString();

    public show: boolean = true;

    public constructor(id: string) {
        this.id = id;
    }

}
