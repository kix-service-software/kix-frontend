/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import { KIXObjectEvent } from '../../modules/base-components/webapp/core/KIXObjectEvent';
import { LoadObjectsRequest } from '../../modules/base-components/webapp/core/LoadObjectsRequest';
import { SocketResponse } from '../../modules/base-components/webapp/core/SocketResponse';
import { KIXObjectServiceRegistry } from '../services/KIXObjectServiceRegistry';
import { LoadObjectsResponse } from '../../modules/base-components/webapp/core/LoadObjectsResponse';
import { LoggingService } from '../../../../server/services/LoggingService';
import { SocketErrorResponse } from '../../modules/base-components/webapp/core/SocketErrorResponse';
import { CreateObjectRequest } from '../../modules/base-components/webapp/core/CreateObjectRequest';
import { CreateObjectResponse } from '../../modules/base-components/webapp/core/CreateObjectResponse';
import { UpdateObjectRequest } from '../../modules/base-components/webapp/core/UpdateObjectRequest';
import { UpdateObjectResponse } from '../../modules/base-components/webapp/core/UpdateObjectResponse';
import { DeleteObjectRequest } from '../../modules/base-components/webapp/core/DeleteObjectRequest';
import { DeleteObjectResponse } from '../../modules/base-components/webapp/core/DeleteObjectResponse';
import { Socket } from 'socket.io';

import cookie from 'cookie';
import { DisplayValueRequest } from '../../model/DisplayValueRequest';
import { DisplayValueResponse } from '../../model/DisplayValueResponse';

export class KIXObjectNamespace extends SocketNameSpace {

    private static INSTANCE: KIXObjectNamespace;

    public static getInstance(): KIXObjectNamespace {
        if (!KIXObjectNamespace.INSTANCE) {
            KIXObjectNamespace.INSTANCE = new KIXObjectNamespace();
        }
        return KIXObjectNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'kixobjects';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, KIXObjectEvent.LOAD_OBJECTS, this.loadObjects.bind(this));
        this.registerEventHandler(client, KIXObjectEvent.CREATE_OBJECT, this.createObject.bind(this));
        this.registerEventHandler(client, KIXObjectEvent.UPDATE_OBJECT, this.updateObject.bind(this));
        this.registerEventHandler(client, KIXObjectEvent.DELETE_OBJECT, this.deleteObject.bind(this));
        this.registerEventHandler(client, KIXObjectEvent.LOAD_DISPLAY_VALUE, this.loadDisplayValue.bind(this));
    }

    private async loadObjects(data: LoadObjectsRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        const service = KIXObjectServiceRegistry.getServiceInstance(data.objectType);
        if (service) {
            const objectResponse = await service.loadObjects(
                token, data.clientRequestId, data.objectType, data.objectIds,
                data.loadingOptions, data.objectLoadingOptions
            );

            const response = new LoadObjectsResponse(
                data.requestId, objectResponse?.objects, objectResponse?.totalCount
            );
            return new SocketResponse(KIXObjectEvent.LOAD_OBJECTS_FINISHED, response);
        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            return new SocketResponse(
                KIXObjectEvent.LOAD_OBJECTS_ERROR, new SocketErrorResponse(data.requestId, errorMessage)
            );
        }
    }

    private async createObject(
        data: CreateObjectRequest, client: Socket
    ): Promise<SocketResponse<CreateObjectResponse | SocketErrorResponse>> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        let response: SocketResponse<CreateObjectResponse | SocketErrorResponse>;

        const service = KIXObjectServiceRegistry.getServiceInstance(data.objectType);
        if (service) {
            const id = await service.createObject(
                token, data.clientRequestId, data.objectType, data.parameter, data.createOptions, data.objectType
            );
            response = new SocketResponse(
                KIXObjectEvent.CREATE_OBJECT_FINISHED, new CreateObjectResponse(data.requestId, id)
            );
        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new SocketResponse(
                KIXObjectEvent.CREATE_OBJECT_ERROR, new SocketErrorResponse(data.requestId, errorMessage)
            );
        }

        return response;
    }

    private async updateObject(
        data: UpdateObjectRequest, client: Socket
    ): Promise<SocketResponse<UpdateObjectResponse>> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        let response;

        const service = KIXObjectServiceRegistry.getServiceInstance(data.objectType);
        if (service) {
            const id = await service.updateObject(
                token, data.clientRequestId, data.objectType, data.parameter,
                data.objectId, data.updateOptions, data.objectType
            );
            response = new SocketResponse(
                KIXObjectEvent.UPDATE_OBJECT_FINISHED, new UpdateObjectResponse(data.requestId, id)
            );
        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new SocketResponse(
                KIXObjectEvent.UPDATE_OBJECT_ERROR, new SocketErrorResponse(data.requestId, errorMessage)
            );
        }

        return response;
    }

    private async deleteObject(
        data: DeleteObjectRequest, client: Socket
    ): Promise<SocketResponse<DeleteObjectResponse>> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        let response;

        const service = KIXObjectServiceRegistry.getServiceInstance(data.objectType);
        if (service) {
            await service.deleteObject(
                token, data.clientRequestId, data.objectType, data.objectId, data.deleteOptions, data.objectType
            );
            response = new SocketResponse(
                KIXObjectEvent.DELETE_OBJECT_FINISHED, new DeleteObjectResponse(data.requestId)
            );
        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new SocketResponse(
                KIXObjectEvent.DELETE_OBJECT_ERROR, new SocketErrorResponse(data.requestId, errorMessage)
            );
        }

        return response;
    }

    private async loadDisplayValue(data: DisplayValueRequest, client: Socket): Promise<SocketResponse> {
        const service = KIXObjectServiceRegistry.getServiceInstance(data.objectType);

        let displayValue = '';
        if (service) {
            displayValue = await service.loadDisplayValue(data.objectType, data.objectId);
        }

        const response = new SocketResponse(
            KIXObjectEvent.LOAD_DISPLAY_VALUE_FINISHED, new DisplayValueResponse(data.requestId, displayValue)
        );

        return response;
    }

}
