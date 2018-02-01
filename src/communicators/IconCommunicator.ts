import {
    ObjectIconLoadRequest,
    ObjectIconLoadResponse,
    IconEvent,
    SocketEvent
} from '@kix/core/dist/model';

import { KIXCommunicator } from './KIXCommunicator';

export class IconCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/icons');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerIconEvents(client);
        });
    }

    private registerIconEvents(client: SocketIO.Socket): void {
        client.on(IconEvent.LOAD_ICON, async (data: ObjectIconLoadRequest) => {
            const icon = await this.objectIconService.getObjectIcon(data.token, data.object, data.objectId);
            client.emit(IconEvent.ICON_LOADED, new ObjectIconLoadResponse(data.requestId, icon));
        });
    }
}
