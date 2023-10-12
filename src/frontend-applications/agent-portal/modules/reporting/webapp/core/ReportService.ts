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
import { Report } from '../../model/Report';
import { ReportDefinition } from '../../model/ReportDefinition';
import { ReportParameter } from '../../model/ReportParamater';
import { DataSource } from '../../model/DataSource';
import { ReportOutputFormat } from '../../model/ReportOutputFormat';

export class ReportService extends KIXObjectService<Report> {

    private static INSTANCE: ReportService = null;

    public static getInstance(): ReportService {
        if (!ReportService.INSTANCE) {
            ReportService.INSTANCE = new ReportService();
        }

        return ReportService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.REPORT);
        this.objectConstructors.set(KIXObjectType.REPORT, [Report]);
        this.objectConstructors.set(KIXObjectType.REPORT_DATA_SOURCE, [DataSource]);
        this.objectConstructors.set(KIXObjectType.REPORT_OUTPUT_FORMAT, [ReportOutputFormat]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.REPORT
            || kixObjectType === KIXObjectType.REPORT_DEFINITION
            || kixObjectType === KIXObjectType.REPORT_OUTPUT_FORMAT
            || kixObjectType === KIXObjectType.REPORT_RESULT
            || kixObjectType === KIXObjectType.REPORT_DATA_SOURCE;
    }

    public async hasRequiredParamatersWithoutDefaults(definition: ReportDefinition): Promise<boolean> {
        if (definition && Array.isArray(definition.Config['Parameters'])) {
            const parameters: ReportParameter[] = definition.Config['Parameters'];
            for (const parameter of parameters) {
                if (parameter.Required && !parameter.Default) {
                    return true;
                }
            }
        }

        return false;
    }



}
