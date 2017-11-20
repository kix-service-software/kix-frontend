import { IWidget, WidgetSize } from '@kix/core/dist/model';

export class UserListWidget implements IWidget {

    public id: string;

    public instanceId: string = Date.now().toString();

    public show: boolean = true;

    public size: WidgetSize.BIG;

    public constructor(id: string) {
        this.id = id;
    }
}
