import { IWidget } from '@kix/core/dist/model';

export class TicketDescriptionWidget implements IWidget {

    public id: string;

    public instanceId: string = Date.now().toString();

    public icon: string = 'dummy';

    public constructor(id: string) {
        this.id = id;
    }
}
