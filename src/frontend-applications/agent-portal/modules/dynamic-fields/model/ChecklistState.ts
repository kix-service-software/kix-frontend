/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BrowserUtil } from '../../base-components/webapp/core/BrowserUtil';

export class ChecklistState {

    public constructor(
        inputState?: ChecklistState,
        public value?: string,
        public icon?: string,
        public done: boolean = true,
        public order: number = 0
    ) {
        if (inputState) {
            this.value = inputState.value;
            this.icon = inputState.icon;
            this.done = BrowserUtil.isBooleanTrue(inputState.done?.toString());
            this.order = inputState.order;
        }
    }
}