/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ReportDefinition } from '../../../model/ReportDefinition';

export class NewReportDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-report-dialog-context';

    public async getDisplayText(): Promise<string> {
        let text = await TranslationService.translate('Translatable#Report');

        const definition = this.getAdditionalInformation(KIXObjectType.REPORT_DEFINITION) as ReportDefinition;
        if (definition) {
            text = definition.Name;
        }

        return text;
    }

}