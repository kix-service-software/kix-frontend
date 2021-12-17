/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';

export class ViewLogFileDialogContext extends Context {

    public static CONTEXT_ID: string = 'view-system-logfile-dialog';

    public getIcon(): string {
        return 'kix-icon-eye';
    }

    public async getDisplayText(): Promise<string> {
        return await TranslationService.translate('Translatable#View Log File');
    }

}
