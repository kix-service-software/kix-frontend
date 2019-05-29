import { KIXObjectService } from "../kix";
import { DynamicField, KIXObjectType } from "../../model";

export class DynamicFieldService extends KIXObjectService<DynamicField> {

    private static INSTANCE: DynamicFieldService = null;

    public static getInstance(): DynamicFieldService {
        if (!DynamicFieldService.INSTANCE) {
            DynamicFieldService.INSTANCE = new DynamicFieldService();
        }

        return DynamicFieldService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.DYNAMIC_FIELD;
    }

    public getLinkObjectName(): string {
        return 'DynamicField';
    }
}
