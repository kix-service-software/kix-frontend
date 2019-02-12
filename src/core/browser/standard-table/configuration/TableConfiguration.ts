import { FilterCriteria } from "../../../model";
import { TableColumnConfiguration } from "./TableColumnConfiguration";
import { ToggleOptions } from "./ToggleOptions";
import { TableHeaderHeight } from "./TableHeaderHeight";
import { TableRowHeight } from "./TableRowHeight";
import { RoutingConfiguration } from "../../router";

export class TableConfiguration {

    public constructor(
        public limit?: number,
        public displayLimit?: number,
        public tableColumns?: TableColumnConfiguration[],
        public filter?: FilterCriteria[],
        public enableSelection?: boolean,
        public toggle?: boolean,
        public toggleOptions?: ToggleOptions,
        public sortOrder?: string,
        public headerHeight?: TableHeaderHeight,
        public rowHeight?: TableRowHeight,
        public emptyResultHint?: string,
        public routingConfiguration?: RoutingConfiguration
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
