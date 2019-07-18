/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
                kixObjectType, null, loadingOptions, objectLoadingOptions
            );
        }

        if (kixObjectType === KIXObjectType.SLA && (!objectIds || !objectIds.length)) {
            return this.slas as O[];
        } else if (objectIds && objectIds.length === 1) {
            const sla = this.slas.find((s) => s.ObjectId === objectIds[0]);
            return sla ? [sla] as O[] : [];
        }

        return await super.loadObjects<O>(kixObjectType, objectIds, loadingOptions, objectLoadingOptions);
    }

}
