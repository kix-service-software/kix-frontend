/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../kix";
import { SystemAddress, KIXObjectType } from "../../model";

export class JobService extends KIXObjectService<SystemAddress> {

    private static INSTANCE: JobService = null;

    public static getInstance(): JobService {
        if (!JobService.INSTANCE) {
            JobService.INSTANCE = new JobService();
        }

        return JobService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.JOB;
    }

    public getLinkObjectName(): string {
        return 'Job';
    }
}
