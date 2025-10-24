/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { MobileShowEvent } from '../../../../model/MobileShowEvent';
import { ContextEvents } from '../../../../../base-components/webapp/core/ContextEvents';
import { MobileShowEventData } from '../../../../model/MobileShowEventData';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public state: ComponentState;

    public onCreate(input: any): void {
        super.onCreate(input, 'mobile-shields');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        window.addEventListener('resize', this.resizeHandling.bind(this), false);
        this.resizeHandling();

        super.registerEventSubscriber(
            function (data: MobileShowEventData, eventId: MobileShowEvent): void {
                if (eventId === MobileShowEvent.CLOSE_ALL_TABS_MOBILE) {
                    this.closeMobile();
                }
                else if (data === MobileShowEventData.SHOW_TOOLBAR || data === MobileShowEventData.SHOW_RIGHT_SIDEBAR) {
                    this.state.activeMobile = 2;
                }
                else if (data) {
                    this.state.activeMobile = 1;
                }
                else {
                    this.state.activeMobile = null;
                }
            },
            [
                MobileShowEvent.SHOW_MOBILE,
                MobileShowEvent.CLOSE_ALL_TABS_MOBILE
            ]
        );

        super.registerEventSubscriber(this.closeMobile, [ContextEvents.CONTEXT_CHANGED]);
    }

    public onDestroy(): void {
        super.onDestroy();
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
    }

    private resizeHandling(): void {
        this.closeMobile();
    }

    public closeMobile(): void {
        EventService.getInstance().publish(MobileShowEvent.SHOW_MOBILE, null);
        this.state.activeMobile = null;
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
