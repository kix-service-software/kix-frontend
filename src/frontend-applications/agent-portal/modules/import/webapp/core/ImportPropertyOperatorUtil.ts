/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ImportPropertyOperator } from './ImportPropertyOperator';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class ImportPropertyOperatorUtil {

    public static async getText(operator: ImportPropertyOperator): Promise<string> {
        switch (operator) {
            case ImportPropertyOperator.REPLACE_EMPTY:
                return await TranslationService.translate('Translatable#Replace empty value');
            case ImportPropertyOperator.FORCE:
                return await TranslationService.translate('Translatable#Force');
            case ImportPropertyOperator.IGNORE:
                return await TranslationService.translate('Translatable#Ignore');
            default:
                return operator;
        }
    }

}
