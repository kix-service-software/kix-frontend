import {
    KIXObjectEvent, LoadObjectsRequest, LoadObjectsResponse, CreateObjectRequest,
    CreateObjectResponse, KIXObjectLoadingOptions, DeleteObjectRequest, DeleteObjectResponse,
    UpdateObjectRequest, UpdateObjectResponse, KIXObjectCache
} from "../core/model";
import { KIXCommunicator } from "./KIXCommunicator";
import { CommunicatorResponse } from "../core/common";
import { KIXObjectServiceRegistry, LoggingService } from "../core/services";
import { ServiceMethod } from "../core/browser";

export class KIXObjectCommunicator extends KIXCommunicator {

    private static INSTANCE: KIXObjectCommunicator;

    public static getInstance(): KIXObjectCommunicator {
        if (!KIXObjectCommunicator.INSTANCE) {
            KIXObjectCommunicator.INSTANCE = new KIXObjectCommunicator();
        }
        return KIXObjectCommunicator.INSTANCE;
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

    private async loadObjects(data: LoadObjectsRequest): Promise<CommunicatorResponse<LoadObjectsResponse<any>>> {
        let response;

        const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(data.objectType);
        if (service) {
            const loadingOptions = data.loadingOptions ? data.loadingOptions : new KIXObjectLoadingOptions();
            await service.loadObjects(
                data.token, data.objectType, data.objectIds, loadingOptions, data.objectLoadingOptions
            ).then((objects: any[]) => {
                response = new CommunicatorResponse(
                    KIXObjectEvent.LOAD_OBJECTS_FINISHED, new LoadObjectsResponse(data.requestId, objects)
                );
            }).catch((error) => {
                LoggingService.getInstance().error(error);
                response = new CommunicatorResponse(KIXObjectEvent.LOAD_OBJECTS_ERROR, error);
            });
        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new CommunicatorResponse(KIXObjectEvent.LOAD_OBJECTS_ERROR, errorMessage);
        }

        return response;
    }

    private async createObject(data: CreateObjectRequest): Promise<CommunicatorResponse<CreateObjectResponse>> {
        let response;

        const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(data.objectType);
        if (service) {
            KIXObjectCache.updateCache(data.objectType, null, ServiceMethod.CREATE, data.parameter, data.createOptions);
            await service.createObject(data.token, data.objectType, data.parameter, data.createOptions)
                .then((id) => {
                    response = new CommunicatorResponse(
                        KIXObjectEvent.CREATE_OBJECT_FINISHED, new CreateObjectResponse(data.requestId, id)
                    );
                }).catch((error) => {
                    LoggingService.getInstance().error(error);
                    response = new CommunicatorResponse(
                        KIXObjectEvent.CREATE_OBJECT_ERROR, error
                    );
                });

        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new CommunicatorResponse(KIXObjectEvent.CREATE_OBJECT_ERROR, errorMessage);
        }

        return response;
    }

    private async updateObject(data: UpdateObjectRequest): Promise<CommunicatorResponse<UpdateObjectResponse>> {
        let response;

        const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(data.objectType);
        if (service) {
            KIXObjectCache.updateCache(data.objectType, data.objectId, ServiceMethod.UPDATE, data.parameter);
            await service.updateObject(data.token, data.objectType, data.parameter, data.objectId, data.updateOptions)
                .then((id) => {
                    response = new CommunicatorResponse(
                        KIXObjectEvent.UPDATE_OBJECT_FINISHED, new UpdateObjectResponse(data.requestId, id)
                    );
                }).catch((error) => {
                    LoggingService.getInstance().error(error);
                    response = new CommunicatorResponse(
                        KIXObjectEvent.UPDATE_OBJECT_ERROR, error
                    );
                });

        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new CommunicatorResponse(KIXObjectEvent.UPDATE_OBJECT_ERROR, errorMessage);
        }

        return response;
    }

    private async deleteObject(data: DeleteObjectRequest): Promise<CommunicatorResponse<DeleteObjectResponse>> {
        let response;

        const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(data.objectType);
        if (service) {
            KIXObjectCache.updateCache(data.objectType, data.objectId, ServiceMethod.DELETE, null, data.deleteOptions);
            await service.deleteObject(data.token, data.objectType, data.objectId, data.deleteOptions)
                .then(() => {
                    response = new CommunicatorResponse(
                        KIXObjectEvent.DELETE_OBJECT_FINISHED, new DeleteObjectResponse(data.requestId)
                    );
                }).catch((error) => {
                    LoggingService.getInstance().error(error);
                    response = new CommunicatorResponse(
                        KIXObjectEvent.DELETE_OBJECT_ERROR, error
                    );
                });
        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            LoggingService.getInstance().error(errorMessage);
            response = new CommunicatorResponse(KIXObjectEvent.DELETE_OBJECT_ERROR, errorMessage);
        }

        return response;
    }

}
