import { SocketEvent } from '@kix/core/dist/model';
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { KIXRouterStore } from '@kix/core/dist/browser/router/KIXRouterStore';
import { BaseTemplateComponentState } from './BaseTemplateComponentState';

// tslint:disable-next-line:no-var-requires
require('babel-polyfill');

declare var io: any;

class BaseTemplateComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = new BaseTemplateComponentState(input.contextId, input.objectId, input.tagLib);
    }

    public async onMount(): Promise<void> {
        ClientStorageHandler.setTagLib(this.state.tagLib);
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));

        const token = ClientStorageHandler.getToken();
        const socketUrl = ClientStorageHandler.getFrontendSocketUrl();

        const configurationSocket = io.connect(socketUrl + "/configuration", {
            query: "Token=" + token
        });

        configurationSocket.on('error', (error) => {
            window.location.replace('/auth');
        });

        if (this.state.contextId) {
            ClientStorageHandler.setContextId(this.state.contextId);
            KIXRouterStore.getInstance().navigate(
                'base-router', this.state.contextId, { objectId: this.state.objectId }
            );
        }
    }

    public toggleConfigurationMode(): void {
        this.state.configurationMode = !this.state.configurationMode;
    }

    private applicationStateChanged(): void {
        this.state.showOverlay = ApplicationStore.getInstance().isShowOverlay();
        this.state.showDialog = ApplicationStore.getInstance().isShowDialog();
        this.state.dialogContent = ApplicationStore.getInstance().getDialogContent();
    }
}

module.exports = BaseTemplateComponent;
