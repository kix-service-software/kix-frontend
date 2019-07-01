import { KIXObjectService } from "../kix";
import { KIXObjectType } from "../../model";

export class ValidService extends KIXObjectService {

    private static INSTANCE: ValidService;

    public static getInstance(): ValidService {
        if (!ValidService.INSTANCE) {
            ValidService.INSTANCE = new ValidService();
        }
        return ValidService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.VALID_OBJECT;
    }

    public getLinkObjectName(): string {
        return 'Valid';
    }


}
