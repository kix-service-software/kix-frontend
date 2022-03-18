/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { ReportDefinition } from '../../model/ReportDefinition';
import { ReportDefinitionProperty } from '../../model/ReportDefinitionProperty';
import { NewReportDialogContext } from './context/NewReportDialogContext';

export class ReportDefinitionDialogUtil {

    public static async openCreateReportDialog(
        reportDefinition: ReportDefinition, outputFormat?: string
    ): Promise<void> {
        await ContextService.getInstance().setActiveContext(
            NewReportDialogContext.CONTEXT_ID, null, null,
            [
                [KIXObjectType.REPORT_DEFINITION, reportDefinition],
                [ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS, outputFormat]
            ]
        );
    }
}