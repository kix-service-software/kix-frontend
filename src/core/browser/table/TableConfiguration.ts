import { FilterCriteria, KIXObjectType } from "../../model";
import { RoutingConfiguration } from "../router";
import { ToggleOptions } from "./ToggleOptions";
import { TableHeaderHeight } from "./TableHeaderHeight";
import { TableRowHeight } from "./TableRowHeight";
import { IColumnConfiguration } from "./IColumnConfiguration";

export class TableConfiguration {

    public constructor(
        public objectType?: KIXObjectType,
        public limit?: number,
        public displayLimit?: number,
        public tableColumns?: IColumnConfiguration[],
        public filter?: FilterCriteria[],
        public enableSelection: boolean = false,
        public toggle: boolean = false,
        public toggleOptions?: ToggleOptions,
        public sortOrder?: string,
        public headerHeight?: TableHeaderHeight,
        public rowHeight?: TableRowHeight,
        public emptyResultHint?: string,
        public routingConfiguration?: RoutingConfiguration,
        public fixedFirstColumn: boolean = false
    ) {

        if (!headerHeight) {
            this.headerHeight = TableHeaderHeight.LARGE;
        }

        if (!rowHeight) {
            this.rowHeight = TableRowHeight.SMALL;
        }

        if (!displayLimit) {
            if (this.headerHeight === TableHeaderHeight.SMALL) {
                this.displayLimit = 5;
            } else {
                if (this.rowHeight === TableRowHeight.SMALL) {
                    this.displayLimit = 10;
                } else {
                    this.displayLimit = 25;
                }
            }
        }

        if (!emptyResultHint) {
            this.emptyResultHint = '0 Datensätze gefunden.';
        }
    }

}
