import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ConfigItemClass } from '../../../../cmdb/model/ConfigItemClass';
import { CMDBService } from '../../../../cmdb/webapp/core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { DynamicFieldTypes } from '../../../model/DynamicFieldTypes';
import { DynamicFieldService } from '../DynamicFieldService';

export class CIReferenceSchema {

    public static registerSchema(): void {
        DynamicFieldService.getInstance().registerConfigSchemaHandler(
            DynamicFieldTypes.CI_REFERENCE, this.getSchemaForCIReference.bind(this)
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private static async getSchemaForCIReference(): Promise<any> {
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

        const states = await CMDBService.getInstance().getDeploymentStates();
        const classes = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS
        );

        const deploymentStatesTitle = await TranslationService.translate('Translatable#Deployment States');
        const deploymentStatesDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_CIRef_DeploymentStates');
        const classesTitle = await TranslationService.translate('Translatable#Asset Classes');
        const classesDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_CIRef_IncidentStates');

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
                DeploymentStates: {
                    type: 'array',
                    format: 'table',
                    uniqueItems: true,
                    title: deploymentStatesTitle,
                    description: deploymentStatesDescription,
                    items: {
                        enumSource: [{
                            source: states.map((s) => {
                                return { value: s.ItemID, title: s.Name };
                            }),
                            title: '{{item.title}}',
                            value: '{{item.value}}'
                        }]
                    }
                },
                ITSMConfigItemClasses: {
                    type: 'array',
                    format: 'table',
                    uniqueItems: true,
                    title: classesTitle,
                    description: classesDescription,
                    items: {
                        enumSource: [{
                            source: classes.map((s) => {
                                return { value: s.ID, title: s.Name };
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