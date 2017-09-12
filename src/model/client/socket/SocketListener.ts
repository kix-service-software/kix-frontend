import { LocalStorageHandler } from '../../../model/client/LocalStorageHandler';

declare var io: any;

export abstract class SocketListener {

    protected createSocket(namespace: string, authenticated: boolean = true): SocketIO.Server {
        const token = LocalStorageHandler.getToken();
        const socketUrl = LocalStorageHandler.getFrontendSocketUrl();

        const options = {};
        if (authenticated) {
            options['query'] = "Token=" + token;
        }

        const socket = io.connect(socketUrl + "/" + namespace, options);

        return socket;
    }

}
