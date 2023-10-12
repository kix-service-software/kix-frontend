/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { ReportResult } from '../../model/ReportResult';

export class ReportResultService extends KIXObjectService<ReportResult> {

    private static INSTANCE: ReportResultService = null;

    public static getInstance(): ReportResultService {
        if (!ReportResultService.INSTANCE) {
            ReportResultService.INSTANCE = new ReportResultService();
        }

        return ReportResultService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.REPORT_RESULT);
        this.objectConstructors.set(KIXObjectType.REPORT_RESULT, [ReportResult]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.REPORT_RESULT;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.REPORT_RESULT) {
            objects = await super.loadObjects<O>(
                KIXObjectType.REPORT_RESULT,
                forceIds || (Array.isArray(objectIds) && objectIds.length) ? objectIds : null,
                loadingOptions, objectLoadingOptions
            );
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

}
