import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { SortUtil } from '../../../../../model/SortUtil';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { Role } from '../../../../user/model/Role';
import { RoleProperty } from '../../../../user/model/RoleProperty';
import { DynamicFieldTypes } from '../../../model/DynamicFieldTypes';
import { DynamicFieldService } from '../DynamicFieldService';

export class SelectionSchema {


    public static registerSchema(): void {
        DynamicFieldService.getInstance().registerConfigSchemaHandler(
            DynamicFieldTypes.SELECTION, this.getSchemaForSelection.bind(this)
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private static async getSchemaForSelection(): Promise<any> {

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

        const translatableValues = await TranslationService.translate('Translatable#Translatable Values');
        const possibleValues = await TranslationService.translate('Translatable#Possible Values');

        const appendValues = await TranslationService.translate('Translatable#Append Values');
        const appendValuesRegex = await TranslationService.translate('Translatable#Append Values - Regex');
        const appendValuesRoleIDs = await TranslationService.translate('Translatable#Append Values - Roles');

        let roles = await KIXObjectService.loadObjects<Role>(KIXObjectType.ROLE);
        roles = SortUtil.sortObjects(roles, RoleProperty.NAME);

        const schema = {
            type: 'object',
            format: 'grid',
            properties: {
                CountMin: {
                    title: countMinTitle,
                    description: countMinDescription,
                    type: 'integer',
                    options: {
                        grid_columns: 3
                    }
                },
                CountMax: {
                    title: countMaxTitle,
                    description: countMaxDescription,
                    type: 'integer',
                    options: {
                        grid_columns: 3
                    }
                },
                CountDefault: {
                    title: countDefaultTitle,
                    description: countDefaultDescription,
                    type: 'integer',
                    options: {
                        grid_columns: 3
                    }
                },
                ItemSeparator: {
                    title: itemSeparatorTitle,
                    description: itemSeparatorDescription,
                    type: 'string',
                    format: 'textarea'
                },
                DefaultValue: {
                    title: defaultValueTitle,
                    description: defaultValueDescription,
                    type: 'string'
                },
                TranslatableValues: {
                    title: translatableValues,
                    description: '',
                    type: 'boolean',
                    format: 'checkbox',
                    options: {
                        grid_columns: 3
                    }
                },
                PossibleValues: {
                    title: possibleValues,
                    description: '',
                    type: 'array',
                    format: 'table',
                    items: {
                        type: 'object',
                        properties: {
                            Key: {
                                title: 'Key',
                                type: 'string'
                            },
                            Value: {
                                title: 'Value',
                                type: 'string'
                            }
                        }
                    }
                },
                AppendValues: {
                    title: appendValues,
                    description: '',
                    type: 'boolean',
                    format: 'checkbox',
                    options: {
                        grid_columns: 3
                    }
                },
                AppendValuesRegexList: {
                    title: appendValuesRegex,
                    type: 'array',
                    format: 'table',
                    items: {
                        type: 'object',
                        properties: {
                            Value: {
                                title: 'Regex',
                                type: 'string'
                            },
                            ErrorMessage: {
                                title: 'RegexError',
                                type: 'string'
                            }
                        }
                    }
                },
                AppendValuesRoleIDs: {
                    type: 'array',
                    format: 'table',
                    uniqueItems: true,
                    title: appendValuesRoleIDs,
                    items: {
                        enumSource: [{
                            source: roles.map((r) => {
                                return { value: r.ID, title: r.Name };
                            }),
                            title: '{{item.title}}',
                            value: '{{item.value}}'
                        }]
                    }
                }
            },
            required: ['CountMin', 'CountMax', 'CountDefault']
        };

        return schema;
    }

}