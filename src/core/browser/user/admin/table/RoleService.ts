import { KIXObjectService } from "../../../kix";
import {
    KIXObjectType, KIXObject, KIXObjectLoadingOptions,
    KIXObjectSpecificLoadingOptions, KIXObjectCache
} from "../../../../model";
import { Role } from "../../../../model/kix/user";

export class RoleService extends KIXObjectService<Role> {

    private static INSTANCE: RoleService = null;

    public static getInstance(): RoleService {
        if (!RoleService.INSTANCE) {
            RoleService.INSTANCE = new RoleService();
        }

        return RoleService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.ROLE;
    }

    public getLinkObjectName(): string {
        return 'Role';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true
    ): Promise<O[]> {

        if (objectType === KIXObjectType.ROLE) {
            if (!KIXObjectCache.hasObjectCache(objectType)) {
                const objects = await super.loadObjects(objectType, null, null, null, false);
                objects.forEach((q) => KIXObjectCache.addObject(objectType, q));
            }

            if (!objectIds) {
                return KIXObjectCache.getObjectCache(objectType);
            }
        }

        return await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions, cache);
    }
}
