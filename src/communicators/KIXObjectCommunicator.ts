import {
    KIXObjectEvent, LoadObjectsRequest, LoadObjectsResponse, CreateObjectRequest, CreateObjectResponse
} from "@kix/core/dist/model";
import { KIXCommunicator } from "./KIXCommunicator";
import { CommunicatorResponse } from "@kix/core/dist/common";
import { KIXObjectServiceRegistry } from "@kix/core/dist/services";

export class KIXObjectCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'kixobjects';
    }

    protected registerEvents(): void {
        this.registerEventHandler(KIXObjectEvent.LOAD_OBJECTS, this.loadObjects.bind(this));
        this.registerEventHandler(KIXObjectEvent.CREATE_OBJECT, this.createObject.bind(this));
    }

    private async loadObjects(data: LoadObjectsRequest): Promise<CommunicatorResponse<LoadObjectsResponse<any>>> {
        let response;

        const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(data.kixObjectType);
        if (service) {
            await service.loadObjects(
                data.token, data.kixObjectType, data.objectIds, data.loadingOptions, data.objectLoadingOptions
            ).then((objects: any[]) => {
                response = new CommunicatorResponse(
                    KIXObjectEvent.LOAD_OBJECTS_FINISHED, new LoadObjectsResponse(data.requestId, objects)
                );
            }).catch((error) => {
                this.loggingService.error(error);
                response = new CommunicatorResponse(KIXObjectEvent.LOAD_OBJECTS_ERROR, error);
            });
        } else {
            const errorMessage = 'No API service registered for object type ' + data.kixObjectType;
            this.loggingService.error(errorMessage);
            response = new CommunicatorResponse(KIXObjectEvent.LOAD_OBJECTS_ERROR, errorMessage);
        }

        return response;
    }

    private async createObject(data: CreateObjectRequest): Promise<CommunicatorResponse<CreateObjectResponse>> {
        let response;

        const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(data.objectType);
        if (service) {
            await service.createObject(data.token, data.objectType, data.parameter)
                .then((id) => {
                    response = new CommunicatorResponse(
                        KIXObjectEvent.CREATE_OBJECT_FINISHED, new CreateObjectResponse(data.requestId, id)
                    );
                }).catch((error) => {
                    this.loggingService.error(error);
                    response = new CommunicatorResponse(KIXObjectEvent.CREATE_OBJECT_ERROR, error);
                });

        } else {
            const errorMessage = 'No API service registered for object type ' + data.objectType;
            this.loggingService.error(errorMessage);
            response = new CommunicatorResponse(KIXObjectEvent.CREATE_OBJECT_ERROR, errorMessage);
        }

        return response;
    }
}
