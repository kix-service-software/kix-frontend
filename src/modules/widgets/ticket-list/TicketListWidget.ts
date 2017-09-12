import { IWidget } from './../../../model/client/components/widget/IWidget';

export class TicketListWidget implements IWidget {

    public id: string = "ticket-list-widget";

    public template: string = "widgets/ticket-list";

    public configurationTemplate: string = "widgets/ticket-list/configuration";

    public title: string = "Ticket Liste";

    public isExternal: boolean = false;

    public getDefaultConfiguration(): any {
        return {};
    }
}
