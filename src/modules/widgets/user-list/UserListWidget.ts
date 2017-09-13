import { UserListConfiguration } from './../../../components/widgets/user-list/model/UserListConfiguration';
import { IWidget } from './../../../model/client/components/widget/IWidget';

export class UserListWidget implements IWidget {

    public id: string;

    public template: string = "widgets/user-list";

    public configurationTemplate: string = "widgets/user-list/configuration";

    public title: string = "User Liste";

    public isExternal: boolean = false;

    public constructor(id: string) {
        this.id = id;
    }

}
