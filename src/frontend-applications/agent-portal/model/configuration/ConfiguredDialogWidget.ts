/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfiguredWidget } from './ConfiguredWidget';
import { KIXObjectType } from '../kix/KIXObjectType';
import { ContextMode } from '../ContextMode';
import { UIComponentPermission } from '../UIComponentPermission';
import { WidgetConfiguration } from './WidgetConfiguration';
import { WidgetSize } from './WidgetSize';

export class ConfiguredDialogWidget extends ConfiguredWidget {

    public constructor(
        instanceId: string,
        configurationId: string,
        public kixObjectType: KIXObjectType | string,
        public contextMode: ContextMode,
        permissions: UIComponentPermission[] = [],
        configuration?: WidgetConfiguration,
        size: WidgetSize = WidgetSize.LARGE
    ) {
        super(instanceId, configurationId, configuration, permissions, size);
    }

}
