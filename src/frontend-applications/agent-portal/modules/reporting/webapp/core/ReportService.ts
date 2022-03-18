/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
