import {
    ObjectIconLoadRequest,
    ObjectIconLoadResponse,
    IconEvent,
    SocketEvent
} from '@kix/core/dist/model';

import { KIXCommunicator } from './KIXCommunicator';

export class IconCommunicator extends KIXCommunicator {

    private client: SocketIO.Socket;

    public getNamespace(): string {
        return 'icons';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.client = client;
        client.on(IconEvent.LOAD_ICON, this.loadIcon.bind(this));
    }

    private async loadIcon(data: ObjectIconLoadRequest): Promise<void> {
        const icon = await this.objectIconService.getObjectIcon(data.token, data.object, data.objectId);
        this.client.emit(IconEvent.ICON_LOADED, new ObjectIconLoadResponse(data.requestId, icon));
    }
}
