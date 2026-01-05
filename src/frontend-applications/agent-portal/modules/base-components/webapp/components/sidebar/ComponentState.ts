/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { AbstractComponentState } from '../../core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public contextList: Context[] = [],
        public reloadSidebarId: string = null,
        public showSidebarArea: boolean = false
    ) {
        super();
    }

}