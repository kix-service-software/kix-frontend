/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../model/IdService';
import { ContextType } from '../../../../../model/ContextType';
import { Context } from '../../../../../model/Context';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { RoutingService } from '../../../../../modules/base-components/webapp/core/RoutingService';
import {
    AuthenticationSocketClient
} from '../../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { IUIModule } from '../../../../../model/IUIModule';
import { TranslationService } from '../../../../translation/webapp/core';
import { ClientNotificationSocketClient } from '../../../../notification/webapp/core/ClientNotificationSocketClient';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';

class Component {

    public state: ComponentState;
    private contextListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('base-template-');
    }

    public async onMount(): Promise<void> {
        const start = Date.now();

        this.state.loading = true;
        this.state.loadingHint = 'Loading';

        await this.checkAuthentication();

        ClientNotificationSocketClient.getInstance();

        const startInitModules = Date.now();
        await KIXModulesService.getInstance().init();
        await this.initModules();
        const endInitModules = Date.now();
        console.debug(`modules initialization finished: ${endInitModules - startInitModules}ms`);


        this.state.translations = await TranslationService.createTranslationObject(['Translatable#Close Sidebars']);

        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'BASE-TEMPLATE',
            contextChanged: (contextId: string, context: Context, type: ContextType) => {
                if (type === ContextType.MAIN) {
                    this.setContext(context);
                }
            },
            contextRegistered: () => { return; }
        });

        this.setContext();

        EventService.getInstance().subscribe(ApplicationEvent.APP_LOADING, {
            eventSubscriberId: 'BASE-TEMPLATE',
            eventPublished: (data: any, eventId: string) => {
                if (eventId === ApplicationEvent.APP_LOADING) {
                    this.state.loading = data.loading;
                    this.state.loadingHint = data.hint;
                }
            }
        });

        EventService.getInstance().subscribe(ApplicationEvent.REFRESH, {
            eventSubscriberId: 'BASE-TEMPLATE-REFRESH',
            eventPublished: (data: any, eventId: string) => {
                if (eventId === ApplicationEvent.REFRESH) {
                    this.state.reload = true;

                    const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
                    if (context) {
                        context.reset(true);
                    }

                    setTimeout(() => {
                        this.state.reload = false;
                        setTimeout(() => {
                            RoutingService.getInstance().routeToInitialContext(true);
                        }, 500);
                    }, 20);
                }
            }
        });

        window.addEventListener('resize', this.hideSidebarIfNeeded.bind(this), false);

        this.state.initialized = true;
        this.state.loading = false;

        const end = Date.now();

        console.debug(`mount base template: ${(end - start) / 1000} sec.`);

        setTimeout(() => {
            RoutingService.getInstance().routeToInitialContext();
        }, 2000);
    }

    public onDestroy(): void {
        window.removeEventListener('resize', this.hideSidebarIfNeeded.bind(this), false);
        ContextService.getInstance().unregisterListener('BASE-TEMPLATE');
    }

    private async checkAuthentication(): Promise<void> {
        if (!AuthenticationSocketClient.getInstance().validateToken()) {
            window.location.replace('/auth');
        }
    }

    private setContext(context: Context = ContextService.getInstance().getActiveContext()): void {
        if (context) {
            this.state.hasExplorer = context.isExplorerBarShown();
            this.hideSidebarIfNeeded();
            this.state.showSidebar = context.isSidebarShown();
            context.registerListener(this.contextListernerId, {
                sidebarToggled: () => {
                    this.state.showSidebar = context.isSidebarShown();
                },
                explorerBarToggled: () => {
                    this.state.hasExplorer = context.isExplorerBarShown();
                },
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                filteredObjectListChanged: () => { return; },
                scrollInformationChanged: () => { return; },
                additionalInformationChanged: () => { return; }
            });
        }
    }

    public hideSidebarIfNeeded(): void {
        const context: Context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        if (context &&
            context.isSidebarShown() &&
            (
                (!this.state.hasExplorer && window.innerWidth <= 1475) ||
                (this.state.hasExplorer && window.innerWidth <= 1700)
            )
        ) {
            context.closeSidebar();
        }
    }

    private async initModules(): Promise<void> {
        const modules = KIXModulesService.getInstance().getModules();

        const uiModules: IUIModule[] = [];
        for (let i = 0; i < modules.length; i++) {
            for (const c of modules[i].initComponents) {
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
    }
}

module.exports = Component;
