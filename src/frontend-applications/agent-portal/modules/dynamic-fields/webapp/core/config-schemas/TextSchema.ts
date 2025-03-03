/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { DynamicFieldTypes } from '../../../model/DynamicFieldTypes';
import { DynamicFieldService } from '../DynamicFieldService';

export class TextSchema {

    // eslint-disable-next-line max-lines-per-function
    public static async registerSchema(): Promise<void> {

        const countMinTitle = await TranslationService.translate('Translatable#Count Min');
        const countMinDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_CountMin');

        const countMaxTitle = await TranslationService.translate('Translatable#Count Max');
        const countMaxDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_CountMax');

        const countDefaultTitle = await TranslationService.translate('Translatable#Count Default');
        const countDefaultDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_CountDefault');

        const itemSeparatorTitle = await TranslationService.translate('Translatable#Item Separator');
        const itemSeparatorDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_ItemSeparator');

        const defaultValueTitle = await TranslationService.translate('Translatable#Default Value');
        const defaultValueDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_Value');

        const regExListTitle: string = await TranslationService.translate('Translatable#RegEx List');
        const regExListDescription: string = await TranslationService.translate('Translatable#Admin_DynamicField_Config_RegexList');
        const regEx: string = await TranslationService.translate('Translatable#RegEx');
        const regExError: string = await TranslationService.translate('Translatable#RegExErrorMessage');

        const schema = {
            type: 'object',
            format: 'grid-strict',
            properties: {
                CountMin: {
                    title: countMinTitle,
                    description: countMinDescription,
                    type: 'integer'
                },
                CountMax: {
                    title: countMaxTitle,
                    description: countMaxDescription,
                    type: 'integer'
                },
                CountDefault: {
                    title: countDefaultTitle,
                    description: countDefaultDescription,
                    type: 'integer'
                },
                ItemSeparator: {
                    title: itemSeparatorTitle,
                    description: itemSeparatorDescription,
                    type: 'string',
                    format: 'textarea',
                    options: {
                        grid_break: true
                    }
                },
                DefaultValue: {
                    title: defaultValueTitle,
                    description: defaultValueDescription,
                    type: 'string',
                    options: {
                        grid_break: true
                    }
                },
                RegExList: {
                    title: regExListTitle,
                    description: regExListDescription,
                    type: 'array',
                    format: 'table',
                    items: {
                        type: 'object',
                        properties: {
                            Value: {
                                title: regEx,
                                type: 'string'
                            },
                            ErrorMessage: {
                                title: regExError,
                                type: 'string'
                            }
                        }
                    }
                }
            },
            required: ['CountMin', 'CountMax', 'CountDefault']
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.TEXT, schema);
    }

}