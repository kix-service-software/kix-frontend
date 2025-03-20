/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class CalendarContext extends Context {

    public static CONTEXT_ID: string = 'calendar';

    public getIcon(): string {
        return 'kix-icon-calendar';
    }

    public async getDisplayText(): Promise<string> {
        return await TranslationService.translate('Translatable#Personal Ticket Calendar');
    }

}
