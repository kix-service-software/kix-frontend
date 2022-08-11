/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ReportDefinition } from '../../../model/ReportDefinition';

export class EditReportDefinitionContext extends Context {

    public static CONTEXT_ID: string = 'edit-report-definition-dialog-context';

    public async getObject<O extends KIXObject>(
        kixObjectType: KIXObjectType = KIXObjectType.REPORT_DEFINITION
    ): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.REPORT_DEFINITION) {
            const reportDefinitionId = this.getObjectId();
            if (reportDefinitionId) {
                const objects = await KIXObjectService.loadObjects<ReportDefinition>(
                    KIXObjectType.REPORT_DEFINITION, [reportDefinitionId], null, null, true
                ).catch(() => []);
                object = objects && objects.length ? objects[0] : null;
            }
        }
        return object;
    }

    public async getDisplayText(): Promise<string> {
        let text = await TranslationService.translate('Translatable#Edit Report Definition');
        const reportDefinition = await this.getObject<ReportDefinition>();
        if (reportDefinition) {
            text = reportDefinition.Name;
        }

        return text;
    }

}