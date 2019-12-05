/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {Context, ContextDescriptor, ContextMode, ContextType, KIXObjectType} from '../../core/model';
import {ComponentState} from './ComponentState';
import {ContextService} from '../../core/browser/context';
import {FactoryService, IdService, ServiceRegistry} from '../../core/browser';
import {RoutingService} from '../../core/browser/router';
import {HomeContext} from '../../core/browser/home';
import {EventService} from '../../core/browser/event';
import {ReleaseContext} from '../../core/browser/release';
import {KIXModulesService} from '../../core/browser/modules';
import {TranslationService} from '../../core/browser/i18n/TranslationService';
import {ApplicationEvent} from '../../core/browser/application';
import {AuthenticationSocketClient} from '../../core/browser/application/AuthenticationSocketClient';
import {AgentService} from '../../core/browser/application/AgentService';
import {SysConfigService} from '../../core/browser/sysconfig';
import {TranslationBrowserFactory, TranslationPatternBrowserFactory} from '../../core/browser/i18n';
import {IUIModule} from '../../core/browser/application/IUIModule';
import {ClientNotificationSocketClient} from '../../core/browser/notification/ClientNotificationSocketClient';

class Component {

    public state: ComponentState;
    private contextListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('base-template-');
    }

    public async onMount(): Promise<void> {
        const start = Date.now();

        FactoryService.getInstance().registerFactory(
            KIXObjectType.TRANSLATION, TranslationBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TRANSLATION_PATTERN, TranslationPatternBrowserFactory.getInstance()
        );

        ServiceRegistry.registerServiceInstance(AgentService.getInstance());
        ServiceRegistry.registerServiceInstance(TranslationService.getInstance());
        ServiceRegistry.registerServiceInstance(SysConfigService.getInstance());

        this.state.loading = true;
        const startTranslation = Date.now();
        this.state.loadingHint = await TranslationService.translate('Translatable#Loading');
        this.state.translations = await TranslationService.createTranslationObject(['Translatable#Close Sidebars']);
        const endTranslation = Date.now();
        console.debug(`translation initialization finished: ${endTranslation - startTranslation}ms`);

        await this.checkAuthentication();

        ClientNotificationSocketClient.getInstance();

        const startInitModules = Date.now();
        await KIXModulesService.getInstance().init();
        await this.initModules();
        const endInitModules = Date.now();
        console.debug(`modules initialization finished: ${endInitModules - startInitModules}ms`);

        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'BASE-TEMPLATE',
            contextChanged: (contextId: string, context: Context, type: ContextType) => {
                if (type === ContextType.MAIN) {
                    this.setContext(context);
                }
            },
            contextRegistered: () => { return; }
        });

        await this.registerHomeContext();

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
                        context.reset();
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

    private async registerHomeContext(): Promise<void> {
        const homeContext = new ContextDescriptor(
            HomeContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'home', ['home'], HomeContext
        );
        await ContextService.getInstance().registerContext(homeContext);
        const releaseContext = new ContextDescriptor(
            ReleaseContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'release', ['release'], ReleaseContext
        );
        await ContextService.getInstance().registerContext(releaseContext);
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
