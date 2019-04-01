import { Context, ContextType, ContextDescriptor, KIXObjectType, ContextMode, ObjectData } from '../../core/model';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../core/browser/context';
import { ComponentsService } from '../../core/browser/components';
import { IdService, FormService } from '../../core/browser';
import { RoutingService } from '../../core/browser/router';
import { HomeContext } from '../../core/browser/home';
import { EventService } from '../../core/browser/event';
import { ReleaseContext } from '../../core/browser/release';
import { KIXModulesService } from '../../core/browser/modules';
import { TranslationService } from '../../core/browser/i18n/TranslationService';
import { ApplicationEvent } from '../../core/browser/application';
import { ObjectDataService } from '../../core/browser/ObjectDataService';
import { AuthenticationSocketClient } from '../../core/browser/application/AuthenticationSocketClient';
import { NotificationSocketClient } from '../../core/browser/notifications';
import { ComponentInput } from './ComponentInput';

class Component {

    public state: ComponentState;
    private contextListernerId: string;

    private objectData: ObjectData;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('base-template-');
    }

    public onInput(input: ComponentInput): void {
        this.objectData = input.objectData;
    }

    public async onMount(): Promise<void> {
        const start = Date.now();

        this.state.loading = true;
        this.state.loadingHint = await TranslationService.translate('Loading ...');

        await this.checkAuthentication();

        NotificationSocketClient.getInstance();

        await KIXModulesService.getInstance().init();

        const modules = KIXModulesService.getInstance().getModules();
        modules.forEach((m) => {
            this.state.moduleTemplates.push(ComponentsService.getInstance().getComponentTemplate(m.initComponentId));
        });

        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, context: Context<any>, type: ContextType) => {
                if (type === ContextType.MAIN) {
                    this.setContext(context);
                }
            }
        });

        ObjectDataService.getInstance().setObjectData(this.objectData);
        await this.bootstrapServices();

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

                    setTimeout(() => {
                        this.state.reload = false;
                        setTimeout(() => {
                            RoutingService.getInstance().routeToInitialContext();
                        }, 500);
                    }, 20);
                }
            }
        });

        this.state.initialized = true;
        this.state.loading = false;

        const end = Date.now();

        console.debug(`mount base template: ${(end - start) / 1000} sec.`);

        setTimeout(() => {
            RoutingService.getInstance().routeToInitialContext();
        }, 500);
    }

    private async checkAuthentication(): Promise<void> {
        if (!AuthenticationSocketClient.getInstance().validateToken()) {
            window.location.replace('/auth');
        }
    }

    private async bootstrapServices(): Promise<void> {
        const homeContext = new ContextDescriptor(
            HomeContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'home', ['home'], HomeContext
        );
        ContextService.getInstance().registerContext(homeContext);
        const releaseContext = new ContextDescriptor(
            ReleaseContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'release', ['release'], ReleaseContext
        );
        ContextService.getInstance().registerContext(releaseContext);

        FormService.getInstance();
        await FormService.getInstance().loadFormConfigurations();
    }

    private setContext(context: Context<any> = ContextService.getInstance().getActiveContext()): void {
        if (context) {
            this.state.hasExplorer = context.isExplorerBarShown();
            context.registerListener(this.contextListernerId, {
                sidebarToggled: () => {
                    this.setGridColumns();
                },
                explorerBarToggled: () => {
                    this.state.hasExplorer = context.isExplorerBarShown();
                    this.setGridColumns();
                },
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                filteredObjectListChanged: () => { return; },
                scrollInformationChanged: () => { return; }
            });
        }
        this.setGridColumns();
    }

    private setGridColumns(): void {
        let gridColumns = '[main-menu-wrapper] 4.5rem';

        if (this.state.hasExplorer) {
            gridColumns += ' [explorer-bar] min-content';
        }

        gridColumns += ' [content] minmax(40rem, auto)';

        const context = ContextService.getInstance().getActiveContext();
        if ((context && context.isSidebarShown())) {
            gridColumns += ' [sidebar-area] min-content';
            this.state.showSidebar = true;
        } else {
            this.state.showSidebar = false;
        }

        gridColumns += ' [sidebar-menu-wrapper] min-content';

        this.state.gridColumns = gridColumns;
    }
}

module.exports = Component;
