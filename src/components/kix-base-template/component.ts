import { SocketEvent } from '@kix/core/dist/model';
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

// tslint:disable-next-line:no-var-requires
require('babel-polyfill');

declare var io: any;

class BaseTemplateComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            auth: false,
            configurationMode: false,
            template: '',
            templatePath: input.contentTemplate,
            tagLib: input.tagLib,
            showOverlay: false,
            showDialog: false,
            dialogContent: null
        };
    }

    public async onMount(): Promise<void> {
        ClientStorageHandler.setTagLib(this.state.tagLib);
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));

        this.state.template = require(this.state.templatePath);

        const token = ClientStorageHandler.getToken();
        const socketUrl = ClientStorageHandler.getFrontendSocketUrl();

        const configurationSocket = io.connect(socketUrl + "/configuration", {
            query: "Token=" + token
        });

        configurationSocket.on(SocketEvent.CONNECT, () => {
            this.state.auth = true;
        });

        configurationSocket.on('error', (error) => {
            window.location.replace('/auth');
        });

        await TranslationHandler.getInstance();
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
