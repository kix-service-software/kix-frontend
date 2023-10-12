/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextType } from '../../../../../model/ContextType';
import { Context } from '../../../../../model/Context';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { RoutingService } from '../../../../../modules/base-components/webapp/core/RoutingService';
import { AuthenticationSocketClient } from '../../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { ClientNotificationSocketClient } from '../../../../notification/webapp/core/ClientNotificationSocketClient';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ClientStorageService } from '../../../../base-components/webapp/core/ClientStorageService';
import { MobileShowEvent } from '../../../model/MobileShowEvent';
import { MobileShowEventData } from '../../../model/MobileShowEventData';
import { ContextHistory } from '../../../../base-components/webapp/core/ContextHistory';
import { IKIXModuleExtension } from '../../../../../model/IKIXModuleExtension';
import { KIXStyle } from '../../../../base-components/model/KIXStyle';
import { PortalNotificationService } from '../../../../portal-notification/webapp/core/PortalNotificationService';

class Component {

    public state: ComponentState;

    private modules: IKIXModuleExtension[];

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input && input.socketTimeout) {
            ClientStorageService.setSocketTimeout(input.socketTimeout);
        }

        this.modules = input.modules;
    }

    public async onMount(): Promise<void> {

        // set base for relative links
        this.setBaseLink();
        const start = Date.now();

        this.state.loading = true;
        this.state.loadingHint = 'Loading';

        await this.checkAuthentication();

        ClientNotificationSocketClient.getInstance();
        PortalNotificationService.getInstance();
        ContextHistory.getInstance();

        const startInitModules = Date.now();
        await KIXModulesService.getInstance().init(this.modules);
        const endInitModules = Date.now();
        console.debug(`modules initialization finished: ${endInitModules - startInitModules}ms`);

        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'BASE-TEMPLATE',
            contextChanged: (contextId: string, context: Context, type: ContextType) => {
                this.setContext(context);
            },
            contextRegistered: () => { return; },
            beforeDestroy: () => null
        });

        EventService.getInstance().subscribe(ApplicationEvent.APP_LOADING, {
            eventSubscriberId: 'BASE-TEMPLATE',
            eventPublished: (data: any, eventId: string): void => {
                if (eventId === ApplicationEvent.APP_LOADING) {
                    this.state.loading = data.loading;
                    this.state.loadingHint = data.hint;
                }
            }
        });

        EventService.getInstance().subscribe(ApplicationEvent.REFRESH, {
            eventSubscriberId: 'BASE-TEMPLATE-REFRESH',
            eventPublished: (data: any, eventId: string): void => {
                this.state.reload = true;

                setTimeout(() => {
                    this.state.reload = false;
                    RoutingService.getInstance().routeToInitialContext(false);
                }, 500);
            }
        });

        EventService.getInstance().subscribe(ApplicationEvent.REFRESH_CONTENT, {
            eventSubscriberId: 'BASE-TEMPLATE-REFRESH',
            eventPublished: (data: any, eventId: string): void => {
                this.state.reloadContent = true;

                setTimeout(() => {
                    this.state.reloadContent = false;
                }, 500);
            }
        });

        EventService.getInstance().subscribe(MobileShowEvent.SHOW_MOBILE, {
            eventSubscriberId: 'BASE-TEMPLATE-MOBILE',
            eventPublished: (data, eventId: MobileShowEvent | string) => {
                this.state.activeMobile = (data === MobileShowEventData.SHOW_MAIN_MENU) ?
                    1 : (data === MobileShowEventData.SHOW_LEFT_SIDEBAR) ?
                        2 : (data === MobileShowEventData.SHOW_RIGHT_SIDEBAR) ?
                            3 : data ? 4 : null;
            }
        });

        window.addEventListener('resize', this.resizeHandling.bind(this), false);

        RoutingService.getInstance().routeToInitialContext();

        this.state.initialized = true;
        this.state.loading = false;

        const end = Date.now();

        console.debug(`mount base template: ${(end - start) / 1000} sec.`);
    }

    private setBaseLink(): void {
        if (window?.location?.origin) {
            const head = document.getElementsByTagName('head');
            if (head && head[0]) {
                const base = document.createElement('base');
                base.href = window?.location?.origin;
                head[0].appendChild(base);
            }
        }
    }

    public onDestroy(): void {
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
        ContextService.getInstance().unregisterListener('BASE-TEMPLATE');
    }

    private async checkAuthentication(): Promise<void> {
        if (!AuthenticationSocketClient.getInstance().validateToken()) {
            window.location.replace('/auth');
        }
    }

    private setContext(context: Context = ContextService.getInstance().getActiveContext()): void {
        if (context) {
            this.resizeHandling();
        }
    }

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= KIXStyle.MOBILE_BREAKPOINT);
    }
}

module.exports = Component;
