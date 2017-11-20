import { IWidget } from '@kix/core/dist/model';

export class TicketInfoWidget implements IWidget {

    public id: string;

    public instanceId: string = Date.now().toString();

    public icon: string = 'dummy';

    public show: boolean = true;

    public constructor(id: string) {
        this.id = id;
    }
}
