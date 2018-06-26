import { Context, ContextType, KIXObjectType, ContextMode, ContextDescriptor } from '@kix/core/dist/model';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { ComponentState } from './ComponentState';
import { ContextService } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { CustomerService } from '@kix/core/dist/browser/customer';
import { TicketService } from '@kix/core/dist/browser/ticket';
import { ContactService } from '@kix/core/dist/browser/contact';
import { HomeContext } from '@kix/core/dist/browser/home';
import { SearchService } from '@kix/core/dist/browser/search';
import { IdService } from '@kix/core/dist/browser';

declare var io: any;

class Component {

    public state: ComponentState;
    private contextListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(
            input.contextId, input.objectData, input.objectId
        );
        this.contextListernerId = IdService.generateDateBasedId('base-template-');
    }

    public async onMount(): Promise<void> {

        await ComponentsService.getInstance().init();
        this.state.initialized = true;

        const token = ClientStorageService.getToken();
        const socketUrl = ClientStorageService.getFrontendSocketUrl();

        const configurationSocket = io.connect(socketUrl + "/configuration", {
            query: "Token=" + token
        });

        configurationSocket.on('error', (error) => {
            window.location.replace('/auth');
        });

        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, context: Context<any>, type: ContextType) => {
                if (type === ContextType.MAIN) {
                    this.setContext(context);
                }
            }
        });

        ContextService.getInstance().setObjectData(this.state.objectData);
        this.bootstrapServices();
        this.setContext();
    }

    private bootstrapServices(): void {
        TicketService.getInstance();
        CustomerService.getInstance();
        ContactService.getInstance();
        SearchService.getInstance();

        const homeContext = new ContextDescriptor(
            HomeContext.CONTEXT_ID, KIXObjectType.ANY, ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'home', HomeContext
        );
        ContextService.getInstance().registerContext(homeContext);

        if (this.state.contextId) {
            ContextService.getInstance().setContext(this.state.contextId, null, null, this.state.objectId);
        } else {
            ContextService.getInstance().setContext(HomeContext.CONTEXT_ID, KIXObjectType.ANY, ContextMode.DASHBOARD);
        }
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
                objectChanged: () => { return; }
            });
        }
        this.setGridColumns();
    }

    public toggleConfigurationMode(): void {
        this.state.configurationMode = !this.state.configurationMode;
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
        }

        gridColumns += ' [sidebar-menu-wrapper] min-content';

        this.state.gridColumns = gridColumns;
    }
}

module.exports = Component;
