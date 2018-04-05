import { SocketEvent } from '@kix/core/dist/model';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import { BaseTemplateComponentState } from './BaseTemplateComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';

declare var io: any;

class BaseTemplateComponent {

    public state: BaseTemplateComponentState;

    public onCreate(input: any): void {
        this.state = new BaseTemplateComponentState(
            input.contextId, input.objectData, input.objectId
        );
    }

    public async onMount(): Promise<void> {
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

        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        ApplicationService.getInstance().addServiceListener(this.applicationStateChanged.bind(this));

        const context = ContextService.getInstance().getContext();
        this.state.hasExplorer = context && context.isExplorerBarShown();
        this.setGridColumns();
    }

    public toggleConfigurationMode(): void {
        this.state.configurationMode = !this.state.configurationMode;
    }

    private async  applicationStateChanged(): Promise<void> {
        this.state.showShieldOverlay = ApplicationService.getInstance().isShowShieldOverlay();
    }

    public contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (id === ContextService.getInstance().getActiveContextId()) {
            if (type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED ||
                type === ContextNotification.CONTEXT_CHANGED ||
                type === ContextNotification.SIDEBAR_BAR_TOGGLED
            ) {
                const context = ContextService.getInstance().getContext();
                this.state.hasExplorer = context && context.isExplorerBarShown();
                this.setGridColumns();
            }
        }
    }

    private setGridColumns(): void {
        let gridColumns = '[menu-col] 4.5rem';

        if (this.state.hasExplorer) {
            gridColumns += ' [explorer-bar] min-content';
        }

        gridColumns += ' [content] minmax(40rem, auto)';

        const context = ContextService.getInstance().getContext();
        if ((context && context.isSidebarShown())) {
            gridColumns += ' [sidebar] min-content';
        }

        gridColumns += ' [sidebar-menu] min-content';

        this.state.gridColumns = gridColumns;
    }
}

module.exports = BaseTemplateComponent;
