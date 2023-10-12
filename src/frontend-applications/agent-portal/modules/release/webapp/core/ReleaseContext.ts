/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class ReleaseContext extends Context {

    public static CONTEXT_ID: string = 'release';

    public getIcon(): string {
        return 'kix-icon-conversationguide';
    }

    public async getDisplayText(): Promise<string> {
        return await TranslationService.translate('Translatable#Welcome');
    }

}
