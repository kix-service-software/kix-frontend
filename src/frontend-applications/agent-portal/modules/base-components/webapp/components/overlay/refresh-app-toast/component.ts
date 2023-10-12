/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { RefreshToastSettings } from '../../../../../../modules/base-components/webapp/core/RefreshToastSettings';
import { ApplicationEvent } from '../../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../../../../modules/base-components/webapp/core/EventService';
import { WindowListener } from '../../../core/WindowListener';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: RefreshToastSettings): void {
        this.state.message = input.message;
    }

    public refreshClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        WindowListener.getInstance().removeBrowserListener();
        location.reload();
    }

    public close(): void {
        EventService.getInstance().publish(ApplicationEvent.CLOSE_OVERLAY);
    }

}

module.exports = Component;
