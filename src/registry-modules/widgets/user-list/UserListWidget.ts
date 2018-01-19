import { IWidget, WidgetSize } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';

export class UserListWidget implements IWidget {

    public id: string;

    public instanceId: string = IdService.generateDateBasedId();

    public constructor(id: string) {
        this.id = id;
    }
}
