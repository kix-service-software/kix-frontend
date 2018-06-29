import { KIXObjectEvent, LoadObjectsRequest, LoadObjectsResponse } from "@kix/core/dist/model";
import { KIXCommunicator } from "./KIXCommunicator";
import { CommunicatorResponse } from "@kix/core/dist/common";
import { KIXObjectServiceRegistry } from "@kix/core/dist/services";

export class KIXObjectCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'kixobjects';
    }

    protected registerEvents(): void {
        this.registerEventHandler(KIXObjectEvent.LOAD_OBJECTS, this.loadObjects.bind(this));
    }

    private async loadObjects(data: LoadObjectsRequest): Promise<CommunicatorResponse<LoadObjectsResponse<any>>> {
        let response;

        const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(data.kixObjectType);
        if (service) {
            await service.loadObjects(data.token, data.objectIds, data.loadingOptions)
                .then((objects: any[]) => {
                    response = new CommunicatorResponse(
                        KIXObjectEvent.LOAD_OBJECTS_FINISHED, new LoadObjectsResponse(data.requestId, objects)
                    );
                }).catch((error) => {
                    response = new CommunicatorResponse(KIXObjectEvent.LOAD_OBJECTS_ERROR, error.errorMessage.body);
                });
        } else {
            const errorMessage = 'No API service registered for object type ' + data.kixObjectType;
            this.loggingService.error(errorMessage);
            response = new CommunicatorResponse(KIXObjectEvent.LOAD_OBJECTS_ERROR, errorMessage);
        }

        return response;
    }

}
