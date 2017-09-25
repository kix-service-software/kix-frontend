import { ISidebar } from '@kix/core';

export class TicketInfoSidebar implements ISidebar {

    public id: string;
    public instanceId: string = Date.now().toString();
    public template: string = "sidebars/ticket-info";
    public configurationTemplate: string = "sidebars/ticket-info/configuration";
    public title: string = "Ticket Info";
    public icon: string = 'dummy';
    public isExternal: boolean = false;

    public constructor(id: string) {
        this.id = id;
    }
}
