import { ClientStorageHandler, SocketEvent, TranslationHandler } from '@kix/core/dist/model/client';

declare var io;

class BaseTemplateComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            auth: false,
            configurationMode: false,
            template: false,
            templatePath: input.contentTemplate
        };
    }

    public async onMount(): Promise<void> {
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
}

module.exports = BaseTemplateComponent;
