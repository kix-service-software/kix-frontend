import { ISidebar } from './../../../model/client/components/';

export class TicketInfoSidebar implements ISidebar {

    public id: string;
    public template: string = "sidebars/ticket-info";
    public configurationTemplate: string = "sidebars/ticket-info/configuration";
    public title: string = "Ticket Info";
    public icon: string = 'dummy';
    public isExternal: boolean = false;

    public constructor(id: string) {
        this.id = id;
    }
}
