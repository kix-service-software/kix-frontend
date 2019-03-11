import { SocketListener } from "../SocketListener";
import {
    KIXObject, KIXObjectType, LoadObjectsRequest, KIXObjectEvent,
    LoadObjectsResponse, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    CreateObjectRequest, CreateObjectResponse, KIXObjectSpecificCreateOptions,
    DeleteObjectRequest, DeleteObjectResponse, UpdateObjectRequest, UpdateObjectResponse,
    KIXObjectSpecificDeleteOptions, ISocketResponse, ISocketObjectRequest, Error
} from "../../model";
import { ClientStorageService } from "../ClientStorageService";
import { IdService } from "../IdService";
import { FactoryService } from "./FactoryService";
import { ObjectDataService } from "../ObjectDataService";

export class KIXObjectSocketListener extends SocketListener {

    private static INSTANCE: KIXObjectSocketListener;

    private static TIMEOUT: number;

    public static getInstance(): KIXObjectSocketListener {
        if (!KIXObjectSocketListener.INSTANCE) {
            KIXObjectSocketListener.INSTANCE = new KIXObjectSocketListener();
        }

        const objectData = ObjectDataService.getInstance().getObjectData();
        KIXObjectSocketListener.TIMEOUT = objectData && objectData.socketTimeout ? objectData.socketTimeout : 30000;

        return KIXObjectSocketListener.INSTANCE;
    }

    private constructor() {
        super();
        this.socket = this.createSocket('kixobjects', true);
    }

    public async loadObjects<T extends KIXObject>(
        kixObjectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        const token = ClientStorageService.getToken();
        const requestId = IdService.generateDateBasedId();

        const request = new LoadObjectsRequest(
            token, requestId, kixObjectType, objectIds, loadingOptions, objectLoadingOptions
        );

        const response = await this.sendRequest<LoadObjectsResponse<T>>(
            request,
            KIXObjectEvent.LOAD_OBJECTS, KIXObjectEvent.LOAD_OBJECTS_FINISHED, KIXObjectEvent.LOAD_OBJECTS_ERROR
        );

        const objects = [];

        for (const object of response.objects) {
            const factoryObject = await FactoryService.getInstance().create<T>(kixObjectType, object);
            objects.push(factoryObject);
        }

        return objects;
    }

    public async createObject(
        objectType: KIXObjectType, parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        const token = ClientStorageService.getToken();
        const requestId = IdService.generateDateBasedId();

        const request = new CreateObjectRequest(
            token, requestId, objectType, parameter, createOptions
        );

        const response = await this.sendRequest<CreateObjectResponse>(
            request,
            KIXObjectEvent.CREATE_OBJECT, KIXObjectEvent.CREATE_OBJECT_FINISHED, KIXObjectEvent.CREATE_OBJECT_ERROR
        );

        return response.objectId;
    }

    public async updateObject(
        objectType: KIXObjectType, parameter: Array<[string, any]>,
        objectId: number | string, updateOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        const token = ClientStorageService.getToken();
        const requestId = IdService.generateDateBasedId();

        const request = new UpdateObjectRequest(
            token, requestId, objectType, parameter, objectId, updateOptions
        );

        const response = await this.sendRequest<UpdateObjectResponse>(
            request,
            KIXObjectEvent.UPDATE_OBJECT, KIXObjectEvent.UPDATE_OBJECT_FINISHED, KIXObjectEvent.UPDATE_OBJECT_ERROR
        );

        return response.objectId;
    }

    public async deleteObject(
        objectType: KIXObjectType, objectId: string | number, deleteOptions: KIXObjectSpecificDeleteOptions
    ): Promise<any> {

        const token = ClientStorageService.getToken();
        const requestId = IdService.generateDateBasedId();

        const request = new DeleteObjectRequest(
            token, requestId, objectType, objectId, deleteOptions
        );

        await this.sendRequest<DeleteObjectResponse>(
            request,
            KIXObjectEvent.DELETE_OBJECT, KIXObjectEvent.DELETE_OBJECT_FINISHED, KIXObjectEvent.DELETE_OBJECT_ERROR
        );
    }

    private async sendRequest<T extends ISocketResponse>(
        requestObject: ISocketObjectRequest, event: string, finishEvent: string, errorEvent: any
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timeout = window.setTimeout(() => {
                const timeoutInSeconds = KIXObjectSocketListener.TIMEOUT / 1000;
                // tslint:disable-next-line:max-line-length
                const error = `Zeitüberschreitung der Anfrage (Event: ${event} - ${requestObject.objectType}) (Timeout: ${timeoutInSeconds} Sekunden)`;
                console.error(error);
                reject(new Error('TIMEOUT', error));
            }, KIXObjectSocketListener.TIMEOUT);

            this.socket.on(finishEvent, (result: T) => {
                if (result.requestId === requestObject.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result);
                }
            });

            this.socket.on(errorEvent, (error: any) => {
                window.clearTimeout(timeout);
                const errorMessage = `Socket Error: Event - ${event}, Object - ${requestObject.objectType}`;
                console.error(errorMessage);
                console.error(error);
                reject(error);
            });

            this.socket.emit(event, requestObject);
        });
    }
}
