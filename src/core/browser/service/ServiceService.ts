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
}
