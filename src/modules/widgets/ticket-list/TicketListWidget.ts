import { IWidget } from './../../../model/client/components/widget/IWidget';

export class TicketListWidget implements IWidget {

    public id: string;

    public template: string = "widgets/ticket-list";

    public configurationTemplate: string = "widgets/ticket-list/configuration";

    public title: string = "Ticket Liste";

    public isExternal: boolean = false;

    public constructor(id: string) {
        this.id = id;
    }

}
