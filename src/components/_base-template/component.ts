import { SocketEvent } from '@kix/core/dist/model';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { BaseTemplateComponentState } from './BaseTemplateComponentState';
import { ContextService } from '@kix/core/dist/browser/context';

declare var io: any;

class BaseTemplateComponent {

    public state: BaseTemplateComponentState;

    public onCreate(input: any): void {
        this.state = new BaseTemplateComponentState(input.contextId, input.objectData, input.objectId, input.tagLib);
    }

    public onMount(): void {
        ClientStorageHandler.setTagLib(this.state.tagLib);

        ContextService.getInstance().setObjectData(this.state.objectData);
        this.state.initialized = true;
        if (this.state.contextId) {
            ComponentRouterStore.getInstance().navigate(
                'base-router', this.state.contextId, { objectId: this.state.objectId }, this.state.objectId
            );
        }

        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));

        const token = ClientStorageHandler.getToken();
        const socketUrl = ClientStorageHandler.getFrontendSocketUrl();

        const configurationSocket = io.connect(socketUrl + "/configuration", {
            query: "Token=" + token
        });

        configurationSocket.on('error', (error) => {
            window.location.replace('/auth');
        });
    }

    public toggleConfigurationMode(): void {
        this.state.configurationMode = !this.state.configurationMode;
    }

    private applicationStateChanged(): void {
        this.state.showShieldOverlay = ApplicationStore.getInstance().isShowShieldOverlay();
        this.state.showInfoOverlay = ApplicationStore.getInstance().isShowInfoOverlay();
        this.state.showMainDialog = ApplicationStore.getInstance().isShowMainDialog();

        if (this.state.showMainDialog) {
            const currentMainDialog = ApplicationStore.getInstance().getCurrentMainDialog();
            if (currentMainDialog[0]) {
                this.state.mainDialogTemplate = ClientStorageHandler.getComponentTemplate(currentMainDialog[0]);
                this.state.mainDialogInput = currentMainDialog[1];
            }
        }

        if (this.state.showInfoOverlay) {
            const currentInfoOverlay = ApplicationStore.getInstance().getCurrentInfoOverlay();
            if (currentInfoOverlay[0]) {
                this.state.infoOverlayIcon = currentInfoOverlay[0].icon;
                this.state.infoOverlayTitle = currentInfoOverlay[0].title;
                this.state.infoOverlayContent = currentInfoOverlay[0].content;
                this.state.infoOverlayPosition = currentInfoOverlay[1];
            }
        }
    }
}

module.exports = BaseTemplateComponent;
