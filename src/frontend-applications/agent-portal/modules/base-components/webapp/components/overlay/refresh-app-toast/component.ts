/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { RefreshToastSettings } from '../../../../../../modules/base-components/webapp/core/RefreshToastSettings';
import { ContextHistory } from '../../../../../../modules/base-components/webapp/core/ContextHistory';
import { ApplicationEvent } from '../../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../../../../modules/base-components/webapp/core/EventService';
import { ContextService } from '../../../core/ContextService';
import { ContextType } from '../../../../../../model/ContextType';
import { AdditionalContextInformation } from '../../../core/AdditionalContextInformation';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: RefreshToastSettings) {
        this.state.message = input.message;
        this.state.reloadApp = input.reloadApp;
    }

    public refreshClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        if (this.state.reloadApp) {
            ContextHistory.getInstance().removeBrowserListener();
            location.reload();
        } else {
            EventService.getInstance().publish(ApplicationEvent.REFRESH);
        }
    }

    public dontShowClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        context.setAdditionalInformation(AdditionalContextInformation.DONT_SHOW_UPDATE_NOTIFICATION, true);

        EventService.getInstance().publish(ApplicationEvent.CLOSE_OVERLAY);
    }

    public close(): void {
        EventService.getInstance().publish(ApplicationEvent.CLOSE_OVERLAY);
    }

}

module.exports = Component;
