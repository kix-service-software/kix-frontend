import { TableColumnConfiguration } from "@kix/core/dist/browser";
import { FilterCriteria } from "@kix/core/dist/model";

export class TicketListSettings {
    public limit: number;
    public displayLimit: number;
    public showTotalCount: boolean;

    public tableColumns: TableColumnConfiguration[];
    public filter: FilterCriteria[];

}
