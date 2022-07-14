/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import cookie from 'cookie';
import { Socket } from 'socket.io';
import { SocketNameSpace } from '../../../server/socket-namespaces/SocketNameSpace';
import { CommitObjectEvent } from '../model/commit-object/CommitObjectEvent';
import { CommitObjectRequest } from '../model/commit-object/CommitObjectRequest';
import { CommitObjectResponse } from '../model/commit-object/CommitObjectResponse';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { SocketResponse } from '../../base-components/webapp/core/SocketResponse';
import { KIXObjectEvent } from '../../base-components/webapp/core/KIXObjectEvent';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { SocketErrorResponse } from '../../base-components/webapp/core/SocketErrorResponse';
import { KIXObject } from '../../../model/kix/KIXObject';

export class CommitObjectNamespace extends SocketNameSpace {

    private static INSTANCE: CommitObjectNamespace;

    public static getInstance(): CommitObjectNamespace {
        if (!CommitObjectNamespace.INSTANCE) {
            CommitObjectNamespace.INSTANCE = new CommitObjectNamespace();
        }
        return CommitObjectNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'object-commit';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, CommitObjectEvent.COMMIT_OBJECT, this.commitObject.bind(this));
    }

    private async commitObject(data: CommitObjectRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const object = data.object;

        const service = KIXObjectServiceRegistry.getServiceInstance(object?.KIXObjectType);
        if (service) {
            const id = await service.commitObject(token, data.clientRequestId, object);
            const objectResponse = new CommitObjectResponse(data.requestId, id);
            return new SocketResponse(CommitObjectEvent.COMMIT_OBJECT_FINISHED, objectResponse);
        } else {
            const errorMessage = 'No API service registered for object type ' + object?.KIXObjectType;
            LoggingService.getInstance().error(errorMessage);
            return new SocketResponse(
                KIXObjectEvent.LOAD_OBJECTS_ERROR, new SocketErrorResponse(data.requestId, errorMessage)
            );
        }
    }

}