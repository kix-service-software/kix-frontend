import { SocketEvent } from '../../model/client/socket/SocketEvent';
import { ClientStorageHandler } from '../../model/client/ClientStorageHandler';

declare var io;

class BaseTemplateComponent {

    public state: any;

    private frontendSocketUrl: string;

    public onCreate(input: any): void {
        this.state = {
            auth: false,
            configurationMode: false
        };

        this.frontendSocketUrl = input.frontendSocketUrl;
    }

    public onMount(): void {
        ClientStorageHandler.setFrontendSocketUrl(this.frontendSocketUrl);

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
