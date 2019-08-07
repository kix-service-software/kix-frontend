/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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

        if (displayLimit === null) {
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
