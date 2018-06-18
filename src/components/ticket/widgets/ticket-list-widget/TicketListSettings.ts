import { TableColumnConfiguration, ToggleOptions, TableRowHeight, TableHeaderHeight } from "@kix/core/dist/browser";
import { FilterCriteria } from "@kix/core/dist/model";

export class TicketListSettings {

    public limit: number;
    public displayLimit: number;
    public showTotalCount: boolean;

    public tableColumns: TableColumnConfiguration[];
    public filter: FilterCriteria[];
    public toggleOptions: ToggleOptions;
    public sortOrder: string;
    public rowHeight: TableRowHeight;
    public headerHeight: TableHeaderHeight;

}
