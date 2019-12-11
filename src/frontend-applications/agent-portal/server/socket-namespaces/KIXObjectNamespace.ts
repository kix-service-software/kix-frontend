/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from "./SocketNameSpace";
import { KIXObjectEvent } from "../../modules/base-components/webapp/core/KIXObjectEvent";
import { LoadObjectsRequest } from "../../modules/base-components/webapp/core/LoadObjectsRequest";
import { SocketResponse } from "../../modules/base-components/webapp/core/SocketResponse";
import { KIXObjectServiceRegistry } from "../services/KIXObjectServiceRegistry";
import { LoadObjectsResponse } from "../../modules/base-components/webapp/core/LoadObjectsResponse";
import { LoggingService } from "../../../../server/services/LoggingService";
import { SocketEvent } from "../../modules/base-components/webapp/core/SocketEvent";
import { SocketErrorResponse } from "../../modules/base-components/webapp/core/SocketErrorResponse";
import { CreateObjectRequest } from "../../modules/base-components/webapp/core/CreateObjectRequest";
import { CreateObjectResponse } from "../../modules/base-components/webapp/core/CreateObjectResponse";
import { UpdateObjectRequest } from "../../modules/base-components/webapp/core/UpdateObjectRequest";
import { UpdateObjectResponse } from "../../modules/base-components/webapp/core/UpdateObjectResponse";
import { DeleteObjectRequest } from "../../modules/base-components/webapp/core/DeleteObjectRequest";
import { DeleteObjectResponse } from "../../modules/base-components/webapp/core/DeleteObjectResponse";
import { PermissionError } from "../../modules/user/model/PermissionError";

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

    private loadObjects(data: LoadObjectsRequest): Promise<SocketResponse> {

        return new Promise<SocketResponse>((resolve, reject) => {
            const service = KIXObjectServiceRegistry.getServiceInstance(data.objectType);
            if (service) {

                service.loadObjects(
                    data.token, data.clientRequestId, data.objectType, data.objectIds,
                    data.loadingOptions, data.objectLoadingOptions
                ).then((objects: any[]) => {
                    resolve(
                        new SocketResponse(
                            KIXObjectEvent.LOAD_OBJECTS_FINISHED, new LoadObjectsResponse(data.requestId, objects)
                        )
                    );
                }).catch((error) => {
                    LoggingService.getInstance().error(`ERROR: ${data.objectType}: ${data.objectIds}`);
                    LoggingService.getInstance().error(JSON.stringify(error));

                    const event = error instanceof PermissionError
                        ? SocketEvent.PERMISSION_ERROR
                        : KIXObjectEvent.LOAD_OBJECTS_ERROR;

                    const errorResponse = new SocketResponse(event, new SocketErrorResponse(data.requestId, error));
                    resolve(errorResponse);
                });
            } else {
                const errorMessage = 'No API service registered for object type ' + data.objectType;
                LoggingService.getInstance().error(errorMessage);
                resolve(
                    new SocketResponse(
                        KIXObjectEvent.LOAD_OBJECTS_ERROR, new SocketErrorResponse(data.requestId, errorMessage)
                    )
                );
            }
        });

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