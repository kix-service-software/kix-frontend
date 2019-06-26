import { FilterCriteria, KIXObjectType, KIXObjectLoadingOptions } from "../../model";
import { RoutingConfiguration, DialogRoutingConfiguration } from "../router";
import { ToggleOptions } from "./ToggleOptions";
import { TableHeaderHeight } from "./TableHeaderHeight";
import { TableRowHeight } from "./TableRowHeight";
import { IColumnConfiguration } from "./IColumnConfiguration";

export class TableConfiguration {

    public constructor(
        public objectType?: KIXObjectType,
        public loadingOptions?: KIXObjectLoadingOptions,
        public displayLimit?: number,
        public tableColumns?: IColumnConfiguration[],
        public enableSelection: boolean = false,
        public toggle: boolean = false,
        public toggleOptions?: ToggleOptions,
        public sortOrder?: string,
        public headerHeight?: TableHeaderHeight,
        public rowHeight?: TableRowHeight,
        public emptyResultHint?: string,
        public routingConfiguration?: RoutingConfiguration | DialogRoutingConfiguration,
        public fixedFirstColumn: boolean = false
    ) {

        if (!headerHeight) {
            this.headerHeight = TableHeaderHeight.LARGE;
        }

        if (!rowHeight) {
            this.rowHeight = TableRowHeight.SMALL;
        }

        if (typeof displayLimit === 'undefined') {
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
            this.emptyResultHint = 'Translatable#0 data sets found.';
        }
    }

}
