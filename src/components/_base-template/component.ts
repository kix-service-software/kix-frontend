import { SocketEvent, Context } from '@kix/core/dist/model';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import { BaseTemplateComponentState } from './BaseTemplateComponentState';
import { ContextService } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { CustomerService } from '@kix/core/dist/browser/customer';
import { TicketService } from '@kix/core/dist/browser/ticket';

declare var io: any;

class BaseTemplateComponent {

    public state: BaseTemplateComponentState;

    public onCreate(input: any): void {
        this.state = new BaseTemplateComponentState(
            input.contextId, input.objectData, input.objectId
        );
    }

    public async onMount(): Promise<void> {
        this.bootstrapServices();
        ContextService.getInstance().setObjectData(this.state.objectData);

        await ComponentsService.getInstance().init();
        this.state.initialized = true;

        if (this.state.contextId) {
            ComponentRouterService.getInstance().navigate(
                'base-router', this.state.contextId, { objectId: this.state.objectId }, this.state.objectId
            );
        }

        const token = ClientStorageService.getToken();
        const socketUrl = ClientStorageService.getFrontendSocketUrl();

        const configurationSocket = io.connect(socketUrl + "/configuration", {
            query: "Token=" + token
        });

        configurationSocket.on('error', (error) => {
            window.location.replace('/auth');
        });

        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, context: Context<any>) => {
                this.setContext(context);
            }
        });

        this.setContext();
    }

    private bootstrapServices(): void {
        TicketService.getInstance();
        CustomerService.getInstance();
    }

    private setContext(context: Context<any> = ContextService.getInstance().getContext()): void {
        this.state.hasExplorer = context && context.isExplorerBarShown();
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

        const context = ContextService.getInstance().getContext();
        if ((context && context.isSidebarShown())) {
            gridColumns += ' [sidebar-area] min-content';
        }

        gridColumns += ' [sidebar-menu-wrapper] min-content';

        this.state.gridColumns = gridColumns;
    }
}

module.exports = BaseTemplateComponent;
