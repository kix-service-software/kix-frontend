import { ObjectIcon, KIXObjectType, KIXObject, ObjectIconLoadingOptions, KIXObjectLoadingOptions } from "../../model";
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

    private icons: ObjectIcon[] = null;

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.OBJECT_ICON;
    }

    public getLinkObjectName(): string {
        return 'ObjectIcon';
    }

}
