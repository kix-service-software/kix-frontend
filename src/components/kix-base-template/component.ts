import { SocketEvent } from '../../model/client/socket/SocketEvent';
import { TokenHandler } from '../../model/client/TokenHandler';

declare var io;

class BaseTemplateComponent {

    public state: any;

    public frontendSocketUrl: string;

    public onCreate(input: any): void {
        this.state = {
            auth: false
        };
        this.frontendSocketUrl = input.frontendSocketUrl;
    }

    public onMount(): void {
        const token = TokenHandler.getToken();

        const configurationSocket = io.connect(this.frontendSocketUrl + "/configuration", {
            query: "Token=" + token
        });

        configurationSocket.on(SocketEvent.CONNECT, () => {
            this.state.auth = true;
        });

        configurationSocket.on('error', (error) => {
            window.location.replace('/auth');
        });
    }
}

module.exports = BaseTemplateComponent;
