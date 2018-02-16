import { TicketProperty } from "@kix/core/dist/model";
import { StandardTableColumn } from "@kix/core/dist/browser";

export class TicketListSettings {

    public limit: number;

    public displayLimit: number;

    public showTotalCount: boolean;

    public tableColumns: StandardTableColumn[];

}
