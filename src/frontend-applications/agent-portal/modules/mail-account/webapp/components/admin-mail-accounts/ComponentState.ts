/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { MailAccountProperty } from '../../../model/MailAccountProperty';
import { SortOrder } from '../../../../../model/SortOrder';

export class ComponentState {
    public constructor(
        public instanceId: string = 'admin-communication-mail-accounts-list',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Communication: Email: Inbox',
            ['mail-account-create', 'mail-account-table-delete', 'csv-export-action'], null,
            new TableWidgetConfiguration(null, null, null, KIXObjectType.MAIL_ACCOUNT,
                [MailAccountProperty.HOST, SortOrder.UP]), false, false, 'kix-icon-gears')
    ) { }

}
