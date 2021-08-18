/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableHeaderHeight } from './TableHeaderHeight';
import { TableRowHeight } from './TableRowHeight';
import { IColumnConfiguration } from './IColumnConfiguration';
import { IConfiguration } from './IConfiguration';
import { ConfigurationType } from './ConfigurationType';
import { KIXObjectType } from '../kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../KIXObjectLoadingOptions';
import { RoutingConfiguration } from './RoutingConfiguration';
import { ToggleOptions } from '../../modules/base-components/webapp/core/table';
import { AdditionalTableObjectsHandlerConfiguration } from '../../modules/base-components/webapp/core/AdditionalTableObjectsHandlerConfiguration';

export class TableConfiguration implements IConfiguration {

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType = ConfigurationType.Table,
        public objectType?: KIXObjectType | string,
        public loadingOptions?: KIXObjectLoadingOptions,
        public displayLimit?: number,
        public tableColumns: IColumnConfiguration[] = [],
        public tableColumnConfigurations: string[] = [],
        public enableSelection: boolean = false,
        public toggle: boolean = false,
        public toggleOptions?: ToggleOptions,
        public sortOrder?: string,
        public headerHeight?: TableHeaderHeight,
        public rowHeight?: TableRowHeight,
        public emptyResultHint?: string,
        public routingConfiguration?: RoutingConfiguration,
        public fixedFirstColumn: boolean = false,
        public additionalTableObjectsHandler: AdditionalTableObjectsHandlerConfiguration[] = [],
        public intersection: boolean = true,
        public searchId: string = null
    ) {

        if (!headerHeight) {
            this.headerHeight = TableHeaderHeight.LARGE;
        }

        if (!rowHeight) {
            this.rowHeight = TableRowHeight.SMALL;
        }

        if (displayLimit === null) {
            if (this.headerHeight <= TableHeaderHeight.SMALL) {
                this.displayLimit = 5;
            } else if (this.rowHeight <= TableRowHeight.SMALL) {
                this.displayLimit = 10;
            } else {
                this.displayLimit = 25;
            }
        }

        if (!emptyResultHint) {
            this.emptyResultHint = 'Translatable#0 data sets found.';
        }
    }

}
