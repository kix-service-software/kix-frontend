import {
    ObjectIconLoadRequest,
    ObjectIconLoadResponse,
    ObjectIconsLoadRequest,
    ObjectIconsLoadResponse,
    IconEvent,
    SocketEvent
} from '@kix/core/dist/model';

import { KIXCommunicator } from './KIXCommunicator';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class IconCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'icons';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, IconEvent.LOAD_ICON, this.loadIcon.bind(this));
        this.registerEventHandler(client, IconEvent.LOAD_ICONS, this.loadIcons.bind(this));
    }

    private async loadIcon(data: ObjectIconLoadRequest): Promise<CommunicatorResponse<ObjectIconLoadResponse>> {
        const icon = await this.objectIconService.getObjectIcon(data.token, data.object, data.objectId);
        const response = new ObjectIconLoadResponse(data.requestId, icon);
        return new CommunicatorResponse(IconEvent.ICON_LOADED, response);
    }

    private async loadIcons(data: ObjectIconsLoadRequest): Promise<CommunicatorResponse<ObjectIconsLoadResponse>> {
        const icons = await this.objectIconService.getIcons(data.token);
        const response = new ObjectIconsLoadResponse(data.requestId, icons);
        return new CommunicatorResponse(IconEvent.ICONS_LOADED, response);
    }
}
