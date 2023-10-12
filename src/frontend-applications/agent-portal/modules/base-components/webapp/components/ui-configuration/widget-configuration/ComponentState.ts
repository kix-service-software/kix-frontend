/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfiguredWidget } from '../../../../../../model/configuration/ConfiguredWidget';
import { IdService } from '../../../../../../model/IdService';
import { AbstractComponentState } from '../../../core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public widget: ConfiguredWidget = null,
        public actionsTreeId: string = IdService.generateDateBasedId('actionsTree'),
        public advancedSettings: boolean = false,
        public prepared: boolean = false,
        public minimized: boolean = false,
        public settingsLabel: string = 'Advanced Settings',
        public isMinimizeEnabled: boolean = true
    ) {
        super();
    }

}
