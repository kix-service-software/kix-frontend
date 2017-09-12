import { ClientStorageHandler } from '../../../model/client/ClientStorageHandler';

declare var io: any;

export abstract class SocketListener {

    protected createSocket(namespace: string, authenticated: boolean = true): SocketIO.Server {
        const socketUrl = ClientStorageHandler.getFrontendSocketUrl();

        const options = {};
        if (authenticated) {
            const token = ClientStorageHandler.getToken();
            options['query'] = "Token=" + token;
        }

        const socket = io.connect(socketUrl + "/" + namespace, options);

        return socket;
    }

}
