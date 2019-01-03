import {
    ObjectIcon, KIXObjectType, KIXObject,
    KIXObjectLoadingOptions, KIXObjectCache, ObjectIconLoadingOptions
} from "../../model";
import { KIXObjectService } from "../kix";

export class ObjectIconService extends KIXObjectService<ObjectIcon> {

    private static INSTANCE: ObjectIconService = null;

    public static getInstance(): ObjectIconService {
        if (!ObjectIconService.INSTANCE) {
            ObjectIconService.INSTANCE = new ObjectIconService();
        }

        return ObjectIconService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.OBJECT_ICON;
    }

    public getLinkObjectName(): string {
        return 'ObjectIcon';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectIconLoadingOptions?: ObjectIconLoadingOptions,
        cache: boolean = true
    ): Promise<O[]> {

        if (objectType === KIXObjectType.OBJECT_ICON) {
            if (!KIXObjectCache.hasObjectCache(objectType)) {
                const objects = await super.loadObjects(objectType, null, null, null, false);
                objects.forEach((i) => KIXObjectCache.addObject(objectType, i));
            }

            if (!objectIds) {
                if (objectIconLoadingOptions) {
                    const icons: any[] = KIXObjectCache.getObjectCache<ObjectIcon>(objectType).filter(
                        (oi) => oi.Object === objectIconLoadingOptions.object
                            && oi.ObjectID.toString() === objectIconLoadingOptions.objectId.toString()
                    );
                    return icons;
                } else {
                    return KIXObjectCache.getObjectCache(objectType);
                }
            }
        }
        return await super.loadObjects<O>(
            objectType, objectIds, loadingOptions, objectIconLoadingOptions, cache
        );
    }

}
