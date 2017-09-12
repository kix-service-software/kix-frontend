import { SocketEvent } from '../../model/client/socket/SocketEvent';
import { LocalStorageHandler } from '../../model/client/LocalStorageHandler';

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
        LocalStorageHandler.setFrontendSocketUrl(this.frontendSocketUrl);

        const token = LocalStorageHandler.getToken();
        const socketUrl = LocalStorageHandler.getFrontendSocketUrl();

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
