import { KIXObjectService } from "../kix";
import {
    KIXObjectType, KIXObject, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, Sla
} from "../../model";

export class SlaService extends KIXObjectService {

    private static INSTANCE: SlaService;

    public static getInstance(): SlaService {
        if (!SlaService.INSTANCE) {
            SlaService.INSTANCE = new SlaService();
        }
        return SlaService.INSTANCE;
    }


    private slas: Array<KIXObject<Sla>>;

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.SLA;
    }

    public getLinkObjectName(): string {
        return KIXObjectType.SLA;
    }

    public async loadObjects<O extends KIXObject>(
        kixObjectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true
    ): Promise<O[]> {

        if (!this.slas) {
            this.slas = await super.loadObjects<Sla>(
                kixObjectType, objectIds, loadingOptions, objectLoadingOptions, cache
            );
        }

        if (kixObjectType === KIXObjectType.SLA && (!objectIds || !objectIds.length)) {
            return this.slas as O[];
        } else if (objectIds && objectIds.length === 1) {
            const sla = this.slas.find((s) => s.ObjectId === objectIds[0]);
            return sla ? [sla] as O[] : [];
        }

        return await super.loadObjects<O>(kixObjectType, objectIds, loadingOptions, objectLoadingOptions, cache);
    }

}
