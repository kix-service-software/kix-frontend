import { SearchOperator } from './SearchOperator';
import { TranslationService } from './i18n/TranslationService';

export class SearchOperatorUtil {

    public static async getText(operator: SearchOperator): Promise<string> {
        switch (operator) {
            case SearchOperator.CONTAINS:
                return await TranslationService.translate('Translatable#contains');
            case SearchOperator.ENDS_WITH:
                return await TranslationService.translate('Translatable#ends with');
            case SearchOperator.EQUALS:
                return await TranslationService.translate('Translatable#equals');
            case SearchOperator.GREATER_THAN:
                return await TranslationService.translate('Translatable#greater than');
            case SearchOperator.GREATER_THAN_OR_EQUAL:
                return await TranslationService.translate('Translatable#greater or equal');
            case SearchOperator.IN:
                return await TranslationService.translate('Translatable#in');
            case SearchOperator.LESS_THAN:
                return await TranslationService.translate('Translatable#less than');
            case SearchOperator.LESS_THAN_OR_EQUAL:
                return await TranslationService.translate('Translatable#less or equal');
            case SearchOperator.LIKE:
                return await TranslationService.translate('Translatable#corresponds to');
            case SearchOperator.NOT_EQUALS:
                return await TranslationService.translate('Translatable#unequal');
            case SearchOperator.STARTS_WITH:
                return await TranslationService.translate('Translatable#starts with');
            default:
                return operator;
        }
    }

}
