import { TicketProperty } from "@kix/core/dist/model";

export class TicketListSettings {

    public limit: number;

    public displayLimit: number;

    public showTotalCount: boolean;

    public properties: TicketProperty[];

}
