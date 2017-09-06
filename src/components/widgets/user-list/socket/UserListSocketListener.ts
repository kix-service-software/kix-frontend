import { SocketEvent } from '../../../../model/client/socket/SocketEvent';

export class UserListSocketListener {
    private socket: SocketIO.Server;

    private store: any;

    public constructor(frontendSocketUrl: string) {
        this.socket = io.connect(frontendSocketUrl + "/users", {});
        this.store = require('../store/');
        this.initSocketListener(this.socket);
    }

    private initSocketListener(socket: SocketIO.Server): void {
        socket.on(SocketEvent.CONNECT, () => {
            console.log("connected to socket server.");
        });

        socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
        });

        socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
        });

        socket.on('error', (error) => {
            console.error(error);
        });
    }
}
