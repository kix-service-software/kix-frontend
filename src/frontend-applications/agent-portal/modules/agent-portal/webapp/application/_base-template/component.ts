/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { IUIModule } from '../../../../../model/IUIModule';
import { ClientNotificationSocketClient } from '../../../../notification/webapp/core/ClientNotificationSocketClient';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ClientStorageService } from '../../../../base-components/webapp/core/ClientStorageService';
import { MobileShowEvent } from '../../../model/MobileShowEvent';
import { MobileShowEventData } from '../../../model/MobileShowEventData';
import { ContextHistory } from '../../../../base-components/webapp/core/ContextHistory';
import { IKIXModuleExtension } from '../../../../../model/IKIXModuleExtension';

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
        const start = Date.now();

        this.state.loading = true;
        this.state.loadingHint = 'Loading';

        await this.checkAuthentication();

        ClientNotificationSocketClient.getInstance();
        ContextHistory.getInstance();

        const startInitModules = Date.now();
        KIXModulesService.getInstance().init(this.modules);
        await this.initModules();
        const endInitModules = Date.now();
        console.debug(`modules initialization finished: ${endInitModules - startInitModules}ms`);

        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'BASE-TEMPLATE',
            contextChanged: (contextId: string, context: Context, type: ContextType) => {
                this.setContext(context);
            },
            contextRegistered: () => { return; }
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
                }, 100);
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
        this.state.isMobile = Boolean(window.innerWidth <= 1024);
    }

    private async initModules(): Promise<void> {
        const modules = KIXModulesService.getInstance().getModules();

        const requireStart = Date.now();
        const uiModules: IUIModule[] = [];
        for (const mod of modules) {
            for (const c of mod.initComponents) {
                try {
                    const component = require(c.componentPath);
                    if (component && component.UIModule) {
                        uiModules.push(new component.UIModule());
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
        const requireEnd = Date.now();
        console.debug(`Require ${modules.length} modules in ${requireEnd - requireStart}ms`);

        const moduleStart = Date.now();
        uiModules.sort((a, b) => a.priority - b.priority);
        for (let i = 0; i < uiModules.length; i++) {
            if (uiModules[i].register) {
                const start = Date.now();
                await uiModules[i].register();
                const end = Date.now();
                console.debug(`regsiter module: ${uiModules[i].priority} - ${uiModules[i].name} - ${end - start}ms`);
            } else {
                console.warn(`module with prioritiy ${uiModules[i].priority} did not implement register() method.`);
            }

            const percent = Math.round((i / uiModules.length) * 100);
            this.state.loadingHint = `${percent}%`;
        }
        const moduleEnd = Date.now();
        console.debug(`Init modules in ${moduleEnd - moduleStart}ms`);
    }
}

module.exports = Component;
