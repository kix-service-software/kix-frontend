/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from 'vm';
import { ContextType } from '../../../../../../model/ContextType';
import { KIXStyle } from '../../../../../base-components/model/KIXStyle';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ApplicationEvent } from '../../../../../base-components/webapp/core/ApplicationEvent';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { MobileShowEvent } from '../../../../model/MobileShowEvent';
import { MobileShowEventData } from '../../../../model/MobileShowEventData';
import { ComponentState } from '../ComponentState';

/* eslint-disable max-lines-per-function */
class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'AGENT-PORTAL-TEMPLATE');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.registerListener();
    }

    public onDestroy(): void {
        super.onDestroy();
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
    }

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= KIXStyle.MOBILE_BREAKPOINT);
    }

    private registerListener(): void {
        ContextService.getInstance().registerListener({
            contextServiceListenerId: 'BASE-TEMPLATE',
            contextChanged: (contextId: string, context: Context, type: ContextType) => {
                this.resizeHandling();
            },
            contextRegistered: () => { return; },
            beforeDestroy: () => null
        });

        super.registerEventSubscriber(
            function (data: any, eventId: string): void {
                this.state.reload = true;

                setTimeout(() => {
                    this.state.reload = false;
                }, 25);
            },
            [ApplicationEvent.REFRESH]
        );

        super.registerEventSubscriber(
            function (data, eventId: MobileShowEvent | string): void {
                if (data === MobileShowEventData.SHOW_MAIN_MENU) {
                    this.state.activeMobile = 1;
                }
                else if (data === MobileShowEventData.SHOW_LEFT_SIDEBAR) {
                    this.state.activeMobile = 2;
                }
                else if (data === MobileShowEventData.SHOW_RIGHT_SIDEBAR) {
                    this.state.activeMobile = 3;
                }
                else if (data) {
                    this.state.activeMobile = 4;
                }
                else {
                    this.state.activeMobile = null;
                }
            },
            [MobileShowEvent.SHOW_MOBILE]
        );

        window.addEventListener('resize', this.resizeHandling.bind(this), false);
    }

}

module.exports = Component;