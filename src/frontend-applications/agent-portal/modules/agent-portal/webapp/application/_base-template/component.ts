/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* eslint-disable max-lines-per-function */

import { ComponentState } from './ComponentState';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { RoutingService } from '../../../../../modules/base-components/webapp/core/RoutingService';
import { SessionAPIClient } from '../../../../../api-client/session/Session';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ClientStorageService } from '../../../../base-components/webapp/core/ClientStorageService';
import { IKIXModuleExtension } from '../../../../../model/IKIXModuleExtension';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { AgentPortalService } from '../../core/AgentPortalService';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';
import { ContextType } from '../../../../../model/ContextType';
import { Context } from 'mocha';
import { MobileShowEvent } from '../../../model/MobileShowEvent';
import { MobileShowEventData } from '../../../model/MobileShowEventData';
import { KIXStyle } from '../../../../base-components/model/KIXStyle';

class Component extends AbstractMarkoComponent<ComponentState> {

    private modules: IKIXModuleExtension[];

    public onCreate(input: any): void {
        super.onCreate(input, 'BASE-TEMPLATE');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        ClientStorageService.setApplicationData(input);
        this.modules = input.modules;
    }

    public async onMount(): Promise<void> {
        console.groupCollapsed('Mount Base Template');
        await super.onMount();
        const start = Date.now();

        this.state.loading = true;
        this.state.loadingHint = 'Loading';

        console.time('Check Authentication');
        await this.checkAuthentication();
        console.timeEnd('Check Authentication');

        await AgentPortalService.initApplication(this.modules);

        this.registerListener();

        RoutingService.getInstance().routeToInitialContext(true);

        this.state.initialized = true;
        this.state.loading = false;

        const end = Date.now();

        console.debug(`mount base template: ${end - start} ms.`);
        console.groupEnd();
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    private async checkAuthentication(): Promise<void> {
        if (!SessionAPIClient.validateToken()) {
            window.location.replace('/auth');
        }

        const currentUser = await SessionAPIClient.getCurrentUser();
        ClientStorageService.setOption('UserId', currentUser?.UserID?.toString());
    }
    private registerListener(): void {
        super.registerEventSubscriber(
            function (data: any, eventId: string): void {
                this.state.loading = data.loading;
                this.state.loadingHint = data.hint;
            },
            [ApplicationEvent.APP_LOADING]
        );

        super.registerEventSubscriber(
            function (data: any, eventId: string): void {
                this.state.applicationTemplate = KIXModulesService.getComponentTemplate(data?.componentId);
                this.state.applicationTemplateData = data?.data || {};
            },
            [ApplicationEvent.SWITCH_APPLICATION_TEMPLATE]
        );

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
                this.state.loading = data.loading;
                this.state.loadingHint = data.hint;
            },
            [ApplicationEvent.APP_LOADING]
        );

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

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= KIXStyle.MOBILE_BREAKPOINT);
    }

}

module.exports = Component;
