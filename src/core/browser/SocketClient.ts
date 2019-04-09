import { ClientStorageService } from "./ClientStorageService";

declare var io: any;

export abstract class SocketClient {

    protected socket: SocketIO.Server;

    protected createSocket(namespace: string, authenticated: boolean = true): SocketIO.Server {
        const socketUrl = ClientStorageService.getFrontendSocketUrl();

        const options = {
            transport: ['websockets']
        };

        if (authenticated) {
            const token = ClientStorageService.getToken();
            options['query'] = "Token=" + token;
        }

        const socket = io.connect(socketUrl + "/" + namespace, options);
        socket.on('error', (error) => {
            console.error(error);
        });

        socket.on('disconnect', () => {
            console.warn('Disconnected from frontend server. Reconnect ...');
            socket.open();
        });

        socket.on('reconnect', (number: number) => {
            console.warn('Reconnect attempt: ' + number);
        });

        socket.on('reconnect_attempt', () => {
            console.warn('Reconnect attempt');
        });


        socket.on('reconnect_error', (error) => {
            console.error('reconnect_error');
            console.error(error);
        });

        socket.on('reconnect_failed', (attempts) => {
            console.error('reconnect_failed: ' + attempts);
        });

        return socket;
    }

}
