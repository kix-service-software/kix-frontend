/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { RefreshToastSettings } from '../../../model/RefreshToastSettings';
import { WindowListener } from '../../../../base-components/webapp/core/WindowListener';
import { DateTimeUtil } from '../../../../base-components/webapp/core/DateTimeUtil';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: RefreshToastSettings): void {
        return;
    }

    public async onMount(): Promise<void> {
        this.state.time = DateTimeUtil.getKIXTimeString(new Date());
    }

    public refreshClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        WindowListener.getInstance().removeBrowserListener();
        location.reload();
    }

}

module.exports = Component;
