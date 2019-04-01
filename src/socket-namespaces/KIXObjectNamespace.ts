import {
    KIXObjectEvent, LoadObjectsRequest, LoadObjectsResponse, CreateObjectRequest,
    CreateObjectResponse, DeleteObjectRequest, DeleteObjectResponse,
    UpdateObjectRequest, UpdateObjectResponse
} from '../core/model';
import { SocketNameSpace } from './SocketNameSpace';
import { SocketResponse, SocketErrorResponse } from '../core/common';
import { KIXObjectServiceRegistry, LoggingService } from '../core/services';

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

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, KIXObjectEvent.LOAD_OBJECTS, this.loadObjects.bind(this));
        this.registerEventHandler(client, KIXObjectEvent.CREATE_OBJECT, this.createObject.bind(this));
        this.registerEventHandler(client, KIXObjectEvent.UPDATE_OBJECT, this.updateObject.bind(this));
        this.registerEventHandler(client, KIXObjectEvent.DELETE_OBJECT, this.deleteObject.bind(this));
    }

    private async loadObjects(data: LoadObjectsRequest): Promise<SocketResponse<LoadObjectsResponse<any>>> {
        let response;

        const service = KIXObjectServiceRegistry.getServiceInstance(data.objectType);
        if (service) {
            await service.loadObjects(
                data.token, data.clientRequestId, data.objectType, data.objectIds,
                data.loadingOptions, data.objectLoadingOptions
            ).then((objects: any[]) => {
                response = new SocketResponse(
                    KIXObjectEvent.LOAD_OBJECTS_FINISHED, new LoadObjectsResponse(data.requestId, objects)
                );
            }).catch((error) => {
                LoggingService.getInstance().error(`ERROR: ${data.objectType}: ${data.objectIds}`);
                LoggingService.getInstance().error(JSON.stringify(error));
                response = new SocketResponse(
                    KIXObjectEvent.LOAD_OBJECTS_ERROR, new SocketErrorResponse(data.requestId, error)
                );
            });
        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new SocketResponse(
                KIXObjectEvent.LOAD_OBJECTS_ERROR, new SocketErrorResponse(data.requestId, errorMessage)
            );
        }

        return response;
    }

    private async createObject(data: CreateObjectRequest): Promise<SocketResponse<CreateObjectResponse>> {
        let response;

        const service = KIXObjectServiceRegistry.getServiceInstance(data.objectType);
        if (service) {
            await service.createObject(
                data.token, data.clientRequestId, data.objectType, data.parameter, data.createOptions, data.objectType
            ).then((id) => {
                response = new SocketResponse(
                    KIXObjectEvent.CREATE_OBJECT_FINISHED, new CreateObjectResponse(data.requestId, id)
                );
            }).catch((error) => {
                LoggingService.getInstance().error(error);
                response = new SocketResponse(
                    KIXObjectEvent.CREATE_OBJECT_ERROR, new SocketErrorResponse(data.requestId, error)
                );
            });

        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new SocketResponse(
                KIXObjectEvent.CREATE_OBJECT_ERROR, new SocketErrorResponse(data.requestId, errorMessage)
            );
        }

        return response;
    }

    private async updateObject(data: UpdateObjectRequest): Promise<SocketResponse<UpdateObjectResponse>> {
        let response;

        const service = KIXObjectServiceRegistry.getServiceInstance(data.objectType);
        if (service) {
            await service.updateObject(
                data.token, data.clientRequestId, data.objectType, data.parameter,
                data.objectId, data.updateOptions, data.objectType
            ).then((id) => {
                response = new SocketResponse(
                    KIXObjectEvent.UPDATE_OBJECT_FINISHED, new UpdateObjectResponse(data.requestId, id)
                );
            }).catch((error) => {
                LoggingService.getInstance().error(error);
                response = new SocketResponse(
                    KIXObjectEvent.UPDATE_OBJECT_ERROR, new SocketErrorResponse(data.requestId, error)
                );
            });
        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new SocketResponse(
                KIXObjectEvent.UPDATE_OBJECT_ERROR, new SocketErrorResponse(data.requestId, errorMessage)
            );
        }

        return response;
    }

    private async deleteObject(data: DeleteObjectRequest): Promise<SocketResponse<DeleteObjectResponse>> {
        let response;

        const service = KIXObjectServiceRegistry.getServiceInstance(data.objectType);
        if (service) {
            await service.deleteObject(
                data.token, data.clientRequestId, data.objectType, data.objectId, data.deleteOptions, data.objectType
            ).then(() => {
                response = new SocketResponse(
                    KIXObjectEvent.DELETE_OBJECT_FINISHED, new DeleteObjectResponse(data.requestId)
                );
            }).catch((error) => {
                LoggingService.getInstance().error(error);
                response = new SocketResponse(
                    KIXObjectEvent.DELETE_OBJECT_ERROR, new SocketErrorResponse(data.requestId, error)
                );
            });
        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new SocketResponse(
                KIXObjectEvent.DELETE_OBJECT_ERROR, new SocketErrorResponse(data.requestId, errorMessage)
            );
        }

        return response;
    }

}
