/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchOperator } from '../../model/SearchOperator';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';


export class SearchOperatorUtil {

    public static async getText(operator: SearchOperator): Promise<string> {
        switch (operator) {
            case SearchOperator.BETWEEN:
                return await TranslationService.translate('Translatable#between');
            case SearchOperator.CONTAINS:
                return await TranslationService.translate('Translatable#contains');
            case SearchOperator.ENDS_WITH:
                return await TranslationService.translate('Translatable#ends with');
            case SearchOperator.EQUALS:
                return await TranslationService.translate('Translatable#equals');
            case SearchOperator.GREATER_THAN:
                return await TranslationService.translate('Translatable#after');
            case SearchOperator.GREATER_THAN_OR_EQUAL:
                return await TranslationService.translate('Translatable#since');
            case SearchOperator.IN:
                return await TranslationService.translate('Translatable#contained in');
            case SearchOperator.LESS_THAN:
                return await TranslationService.translate('Translatable#before');
            case SearchOperator.LESS_THAN_OR_EQUAL:
                return await TranslationService.translate('Translatable#until');
            case SearchOperator.LIKE:
                return await TranslationService.translate('Translatable#Wildcard Search');
            case SearchOperator.NOT_EQUALS:
                return await TranslationService.translate('Translatable#unequal');
            case SearchOperator.STARTS_WITH:
                return await TranslationService.translate('Translatable#starts with');
            default:
                return operator;
        }
    }
}
