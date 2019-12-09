/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from "../../../../../model/configuration/WidgetConfiguration";
import { ITable } from "../../../../base-components/webapp/core/table";
import { IAction } from "../../../../../modules/base-components/webapp/core/IAction";
import { ObjectIcon } from "../../../../icon/model/ObjectIcon";


export class ComponentState {

    public constructor(
        public instanceId: string = 'search-dashboard-result-list-widget',
        public widgetConfiguration: WidgetConfiguration = null,
        public resultTitle: string = "Translatable#Hit List",
        public resultIcon: string | ObjectIcon = null,
        public table: ITable = null,
        public noSearch: boolean = true,
        public actions: IAction[] = [],
        public loading: boolean = false,
        public tableId: string = null,
        public filterCount: number = null
    ) { }

}
