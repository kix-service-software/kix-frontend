/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { JobFactory } from '../../object-factories/JobFactory';
import { Job } from '../../../model/kix/job/Job';
import { MacroFactory } from '../../object-factories/MacroFactory';

export class JobService extends KIXObjectService {

    private static INSTANCE: JobService;

    public static getInstance(): JobService {
        if (!JobService.INSTANCE) {
            JobService.INSTANCE = new JobService();
        }
        return JobService.INSTANCE;
    }

    private constructor() {
        super([new JobFactory(), new MacroFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'automation', 'jobs');

    public objectType: KIXObjectType = KIXObjectType.JOB;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.JOB;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.JOB) {
            objects = await super.load<Job>(
                token, KIXObjectType.JOB, this.RESOURCE_URI, loadingOptions, objectIds, 'Job'
            );
        }

        return objects;
    }

}
