import {
    ObjectIconsResponse, CreateObjectIcon, CreateObjectIconRequest, CreateObjectIconResponse,
    UpdateObjectIcon, UpdateObjectIconResponse, UpdateObjectIconRequest
} from '../../../api';
import {
    ObjectIcon, KIXObjectType, KIXObjectCache, ObjectIconCacheHandler,
    KIXObjectLoadingOptions, ObjectIconLoadingOptions
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';

export class ObjectIconService extends KIXObjectService {

    private static INSTANCE: ObjectIconService;

    public static getInstance(): ObjectIconService {
        if (!ObjectIconService.INSTANCE) {
            ObjectIconService.INSTANCE = new ObjectIconService();
        }
        return ObjectIconService.INSTANCE;
    }

    protected RESOURCE_URI: string = "objecticons";

    public kixObjectType: KIXObjectType = KIXObjectType.OBJECT_ICON;

    private constructor() {
        super();
        KIXObjectServiceRegistry.getInstance().registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.OBJECT_ICON;
    }

    public async initCache(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const token = serverConfig.BACKEND_API_TOKEN;

        KIXObjectCache.registerCacheHandler(new ObjectIconCacheHandler());

        await this.getObjectIcons(token);
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, iconLoadingOptions: ObjectIconLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.OBJECT_ICON) {
            const objectIcons = await this.getObjectIcons(token);
            if (objectIds && objectIds.length) {
                objects = objectIcons.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            } else if (iconLoadingOptions) {
                if (iconLoadingOptions.object && iconLoadingOptions.objectId) {
                    const icon = objectIcons.find(
                        (oi) => oi.Object === iconLoadingOptions.object
                            && oi.ObjectID.toString() === iconLoadingOptions.objectId.toString()
                    );
                    if (icon) {
                        objects = [icon];
                    }
                }
            } else {
                objects = objectIcons;
            }
        }

        return objects;
    }

    public async getObjectIcons(token: string): Promise<ObjectIcon[]> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.OBJECT_ICON)) {
            const uri = this.buildUri(this.RESOURCE_URI);
            const response = await this.getObjectByUri<ObjectIconsResponse>(token, uri);
            response.ObjectIcon
                .map((s) => new ObjectIcon(
                    s.Object, s.ObjectID, s.ContentType, s.Content,
                    s.ID, s.CreateBy, s.CreateTime, s.ChangeBy, s.ChangeTime
                ))
                .forEach((s) => KIXObjectCache.addObject(KIXObjectType.OBJECT_ICON, s));
        }
        return KIXObjectCache.getObjectCache(KIXObjectType.OBJECT_ICON);
    }

    public async createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {

        const createObjectIcon = new CreateObjectIcon(parameter);
        const response = await this.sendCreateRequest<CreateObjectIconResponse, CreateObjectIconRequest>(
            token, this.RESOURCE_URI, new CreateObjectIconRequest(createObjectIcon))
            .catch((error) => {
                throw error;
            });

        return response.ObjectIconID;
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateObjectIcon = new UpdateObjectIcon(parameter);

        const response = await this.sendUpdateRequest<UpdateObjectIconResponse, UpdateObjectIconRequest>(
            token, this.buildUri(this.RESOURCE_URI, objectId), new UpdateObjectIconRequest(updateObjectIcon)
        ).catch((error) => {
            throw error;
        });

        return response.ObjectIconID;
    }
}
