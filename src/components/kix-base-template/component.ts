import { ClientStorageHandler, SocketEvent } from '@kix/core/dist/model/client';

declare var io;

class BaseTemplateComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            auth: false,
            configurationMode: false
        };
    }

    public onMount(): void {
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
    }

    public toggleConfigurationMode(): void {
        this.state.configurationMode = !this.state.configurationMode;
    }
}

module.exports = BaseTemplateComponent;
