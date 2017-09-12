import { LocalStorageHandler } from '../../../model/client/LocalStorageHandler';

declare var io: any;

export abstract class SocketListener {

    protected createSocket(namespace: string, authenticated: boolean = true): SocketIO.Server {
        const socketUrl = LocalStorageHandler.getFrontendSocketUrl();

        const options = {};
        if (authenticated) {
            const token = LocalStorageHandler.getToken();
            options['query'] = "Token=" + token;
        }

        const socket = io.connect(socketUrl + "/" + namespace, options);

        return socket;
    }

}
