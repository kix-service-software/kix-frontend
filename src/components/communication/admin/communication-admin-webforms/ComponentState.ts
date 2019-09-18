/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    WidgetConfiguration, KIXObjectType, TableWidgetSettings, SortOrder
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";
import { WebformProperty } from "../../../../core/model/webform";

export class ComponentState {
    public constructor(
        public instanceId: string = IdService.generateDateBasedId('communication-webforms-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Communication: Webform', ['webform-create-action'],
            new TableWidgetSettings(
                KIXObjectType.WEBFORM,
                [WebformProperty.TITLE, SortOrder.UP]
            ), false, false, 'kix-icon-gears'
        )
    ) { }

}
