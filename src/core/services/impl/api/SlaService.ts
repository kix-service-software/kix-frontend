import { KIXObjectService } from "./KIXObjectService";
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, Sla
} from "../../../model";
import { KIXObjectServiceRegistry } from "../../KIXObjectServiceRegistry";
import { SlaFactory } from "../../object-factories/SlaFactory";

export class SlaService extends KIXObjectService {

    protected objectType: KIXObjectType = KIXObjectType.SLA;

    private static INSTANCE: SlaService;

    public static getInstance(): SlaService {
        if (!SlaService.INSTANCE) {
            SlaService.INSTANCE = new SlaService();
        }
        return SlaService.INSTANCE;
    }

    private constructor() {
        super([new SlaFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(type: KIXObjectType): boolean {
        return type === KIXObjectType.SLA;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'slas');

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.SLA:
                objects = await super.load<Sla>(
                    token, KIXObjectType.SLA, this.RESOURCE_URI, loadingOptions, objectIds, 'SLA'
                );
                break;
            default:
        }

        return objects;
    }

}
