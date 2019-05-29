import { KIXObjectService } from "../kix";
import { KIXObjectType, KIXObjectLoadingOptions, KIXObject, KIXObjectSpecificLoadingOptions } from "../../model";

export class ServiceService extends KIXObjectService {

    private static INSTANCE: ServiceService;

    public static getInstance(): ServiceService {
        if (!ServiceService.INSTANCE) {
            ServiceService.INSTANCE = new ServiceService();
        }
        return ServiceService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(type: KIXObjectType) {
        return type === KIXObjectType.SERVICE;
    }

    public getLinkObjectName(): string {
        return KIXObjectType.SERVICE;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.SERVICE) {
            objects = await super.loadObjects<O>(KIXObjectType.SERVICE, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.some((oid) => c.ObjectId === oid));
        }

        return objects;
    }


}
