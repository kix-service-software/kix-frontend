import {
    ObjectIcon, KIXObjectType, KIXObject, KIXObjectLoadingOptions,
    KIXObjectSpecificLoadingOptions, ObjectIconLoadingOptions
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

    private constructor() {
        super();
    }


    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        const icons = await super.loadObjects<ObjectIcon>(KIXObjectType.OBJECT_ICON, null);
        if (objectLoadingOptions && objectLoadingOptions instanceof ObjectIconLoadingOptions) {
            const icon = icons.find(
                (i) => {
                    const objectId = objectLoadingOptions.objectId
                        ? objectLoadingOptions.objectId.toString()
                        : null;
                    return i.ObjectID.toString() === objectId && i.Object === objectLoadingOptions.object;
                }
            );

            if (icon) {
                return [icon as any];
            }
        }

        return [];
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.OBJECT_ICON;
    }

    public getLinkObjectName(): string {
        return 'ObjectIcon';
    }

}
