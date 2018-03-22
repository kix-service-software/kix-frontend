import {
    ObjectIconLoadRequest,
    ObjectIconLoadResponse,
    IconEvent,
    SocketEvent
} from '@kix/core/dist/model';

import { KIXCommunicator } from './KIXCommunicator';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class IconCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'icons';
    }

    protected registerEvents(): void {
        this.registerEventHandler(IconEvent.LOAD_ICON, this.loadIcon.bind(this));
    }

    private async loadIcon(data: ObjectIconLoadRequest): Promise<CommunicatorResponse> {
        const icon = await this.objectIconService.getObjectIcon(data.token, data.object, data.objectId);
        return new CommunicatorResponse(IconEvent.ICON_LOADED, new ObjectIconLoadResponse(data.requestId, icon));
    }
}
