/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ReportDefinition } from '../../model/ReportDefinition';

export class ReportDefinitionService extends KIXObjectService<ReportDefinition> {

    private static INSTANCE: ReportDefinitionService = null;

    public static getInstance(): ReportDefinitionService {
        if (!ReportDefinitionService.INSTANCE) {
            ReportDefinitionService.INSTANCE = new ReportDefinitionService();
        }

        return ReportDefinitionService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.REPORT_DEFINITION);
        this.objectConstructors.set(KIXObjectType.REPORT_DEFINITION, [ReportDefinition]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.REPORT_DEFINITION;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.REPORT_DEFINITION) {
            objects = await super.loadObjects<O>(
                KIXObjectType.REPORT_DEFINITION,
                forceIds || (Array.isArray(objectIds) && objectIds.length) ? objectIds : null,
                loadingOptions
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
