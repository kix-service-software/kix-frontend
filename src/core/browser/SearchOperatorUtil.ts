import { SearchOperator } from './SearchOperator';
import { TranslationService } from './i18n/TranslationService';

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
