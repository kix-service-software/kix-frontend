import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { DynamicFieldTypes } from '../../../model/DynamicFieldTypes';
import { DynamicFieldService } from '../DynamicFieldService';

export class TableSchema {

    // eslint-disable-next-line max-lines-per-function
    public static async registerSchema(): Promise<void> {

        const columns = await TranslationService.translate('Translatable#Columns');
        const rowsMinTitle = await TranslationService.translate('Translatable#Number of rows (min)');
        const rowsMinDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_Table_RowsMin');
        const rowsinitTitle = await TranslationService.translate('Translatable#Number of rows (init)');
        const rowsinitDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_Table_RowsInit');
        const rowsMaxTitle = await TranslationService.translate('Translatable#Number of rows (max)');
        const rowsMaxDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_Table_RowsMax');
        const translatableColumns = await TranslationService.translate('Translatable#Translatable Columns');

        const schema = {
            'type': 'object',
            'format': 'grid-strict',
            'properties': {
                'RowsMin': {
                    'title': rowsMinTitle,
                    'description': rowsMinDescription,
                    'type': 'integer',
                    'default': '1',
                    'minimum': '0',
                    'required': true
                },
                'RowsInit': {
                    'title': rowsinitTitle,
                    'description': rowsinitDescription,
                    'type': 'integer',
                    'default': '1',
                    'minimum': '0',
                    'required': true
                },
                'RowsMax': {
                    'title': rowsMaxTitle,
                    'description': rowsMaxDescription,
                    'type': 'integer',
                    'default': '1',
                    'minimum': '0',
                    'required': true
                },
                'TranslatableColumn': {
                    'title': translatableColumns,
                    'description': '',
                    'type': 'boolean',
                    'format': 'checkbox',
                    'required': false,
                    'options': {
                        'grid_break': true
                    }
                },
                'Columns': {
                    'title': columns,
                    'description': '',
                    'type': 'array',
                    'required': true,
                    'format': 'table',
                    'items': {
                        'type': 'string'
                    }
                }
            }
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.TABLE, schema);
    }

}