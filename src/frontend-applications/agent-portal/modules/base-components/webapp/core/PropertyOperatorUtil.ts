/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PropertyOperator } from './PropertyOperator';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class PropertyOperatorUtil {

    public static async getText(operator: PropertyOperator): Promise<string> {
        switch (operator) {
            case PropertyOperator.CHANGE:
                return await TranslationService.translate('Translatable#Change to');
            case PropertyOperator.CLEAR:
                return await TranslationService.translate('Translatable#Clear');
            default:
                return;
        }
    }

}
