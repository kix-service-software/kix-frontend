/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetSize } from './WidgetSize';
import { WidgetConfiguration } from './WidgetConfiguration';
import { UIComponentPermission } from '../UIComponentPermission';

export class ConfiguredWidget {
    public constructor(
        public instanceId: string,
        public configurationId: string,
        public configuration?: WidgetConfiguration,
        public permissions: UIComponentPermission[] = [],
        public size: WidgetSize = WidgetSize.LARGE,
    ) { }
}
