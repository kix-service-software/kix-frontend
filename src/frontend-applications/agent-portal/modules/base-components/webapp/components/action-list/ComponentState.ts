/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ActionGroup } from '../../../model/ActionGroup';
import { IAction } from '../../core/IAction';

export class ComponentState {

    public constructor(
        public listDefault: Array<ActionGroup | IAction> = [],
        public listExpansion: Array<ActionGroup | IAction> = [],
        public displayText: boolean = true,
        public prepared: boolean = false
    ) { }
}
