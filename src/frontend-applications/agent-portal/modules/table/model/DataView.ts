/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetType } from '../../../model/configuration/WidgetType';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class DataView {

    public constructor(
        public id: string,
        public name: string,
        public componentId: string,
        public icon: string,
        public objectTypes: Array<KIXObjectType | string> = [KIXObjectType.TICKET],
        public widgetTypes: Array<WidgetType | string> = [WidgetType.CONTENT]
    ) { }
}