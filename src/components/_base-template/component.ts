import { SocketEvent } from '@kix/core/dist/model';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
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
            ComponentRouterService.getInstance().navigate(
                'base-router', this.state.contextId, { objectId: this.state.objectId }, this.state.objectId
            );
        }

        ApplicationService.getInstance().addServiceListener(this.applicationStateChanged.bind(this));

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
        this.state.showShieldOverlay = ApplicationService.getInstance().isShowShieldOverlay();
        this.state.showInfoOverlay = ApplicationService.getInstance().isShowInfoOverlay();
        this.state.showMainDialog = ApplicationService.getInstance().isShowMainDialog();

        if (this.state.showMainDialog) {
            const currentMainDialog = ApplicationService.getInstance().getCurrentMainDialog();
            if (currentMainDialog[0]) {
                this.state.mainDialogTemplate = ClientStorageHandler.getComponentTemplate(currentMainDialog[0]);
                this.state.mainDialogInput = currentMainDialog[1];
            }
        }
    }
}

module.exports = BaseTemplateComponent;
