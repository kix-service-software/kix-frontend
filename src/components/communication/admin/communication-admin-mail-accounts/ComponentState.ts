/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    WidgetConfiguration, KIXObjectType, TableWidgetSettings, SortOrder, MailAccountProperty
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {
    public constructor(
        public instanceId: string = IdService.generateDateBasedId('communication-mail-accounts-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Communication: Email: Email Accounts',
            ['mail-account-create', 'csv-export-action'],
            new TableWidgetSettings(KIXObjectType.MAIL_ACCOUNT,
                [MailAccountProperty.HOST, SortOrder.UP]), false, false, 'kix-icon-gears')
    ) { }

}
