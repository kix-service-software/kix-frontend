/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { DynamicFieldService } from './DynamicFieldService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../base-components/webapp/core/table';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { DynamicFieldLabelProvider } from './DynamicFieldLabelProvider';
import { DynamicFieldTableFactory } from './DynamicFieldTableFactory';
import { ActionFactory } from '../../../base-components/webapp/core/ActionFactory';
import { DynamicFieldCreateAction } from './DynamicFieldCreateAction';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { NewDynamicFieldDialogContext } from './NewDynamicFieldDialogContext';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { DynamicFieldFormService } from './DynamicFieldFormService';
import { EditDynamicFieldDialogContext } from './EditDynamicFieldDialogContext';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { DynamicFieldValuePlaceholderHandler } from './DynamicFieldValuePlaceholderHandler';
import { DynamicFieldTypes } from '../../model/DynamicFieldTypes';
import { FormValidationService } from '../../../base-components/webapp/core/FormValidationService';
import { DynamicFieldTextValidator } from './DynamicFieldTextValidator';
import { DynamicFieldDateTimeValidator } from './DynamicFieldDateTimeValidator';
import { CMDBService } from '../../../cmdb/webapp/core';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { ConfigItemClass } from '../../../cmdb/model/ConfigItemClass';
import { DynamicFieldTypeLabelProvider } from './DynamicFieldTypeLabelProvider';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { DynamicFieldTableValidator } from './DynamicFieldTableValidator';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class UIModule implements IUIModule {

    public priority: number = 400;

    public name: string = 'DynamicFieldsUIModule';


    private countMinTitle: string;
    private countMinDescription: string;
    private countMaxTitle: string;
    private countMaxDescription: string;
    private countDefaultTitle: string;
    private countDefaultDescription: string;
    private itemSeparatorTitle: string;
    private itemSeparatorDescription: string;
    private defaultValueTitle: string;
    private defaultValueDescription: string;

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(DynamicFieldService.getInstance());
        ServiceRegistry.registerServiceInstance(DynamicFieldFormService.getInstance());

        PlaceholderService.getInstance().registerPlaceholderHandler(DynamicFieldValuePlaceholderHandler.getInstance());

        TableFactoryService.getInstance().registerFactory(new DynamicFieldTableFactory());

        LabelService.getInstance().registerLabelProvider(new DynamicFieldLabelProvider());
        LabelService.getInstance().registerLabelProvider(new DynamicFieldTypeLabelProvider());

        ActionFactory.getInstance().registerAction('dynamic-field-create-action', DynamicFieldCreateAction);

        const newDynamicFieldContext = new ContextDescriptor(
            NewDynamicFieldDialogContext.CONTEXT_ID, [KIXObjectType.DYNAMIC_FIELD],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['dynamicfields'], NewDynamicFieldDialogContext,
            [
                new UIComponentPermission('system/dynamicfields', [CRUD.CREATE])
            ],
            'Translatable#New Dynamic Field', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(newDynamicFieldContext);

        const editDynamicFieldContext = new ContextDescriptor(
            EditDynamicFieldDialogContext.CONTEXT_ID, [KIXObjectType.DYNAMIC_FIELD],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['dynamicfields'], EditDynamicFieldDialogContext,
            [
                new UIComponentPermission('system/dynamicfields', [CRUD.CREATE])
            ],
            'Translatable#Edit Dynamic Field', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(editDynamicFieldContext);

        FormValidationService.getInstance().registerValidator(new DynamicFieldTextValidator());
        FormValidationService.getInstance().registerValidator(new DynamicFieldDateTimeValidator());
        FormValidationService.getInstance().registerValidator(new DynamicFieldTableValidator());

        await this.registerSchemas();
    }

    // tslint:disable:max-line-length
    private async registerSchemas(): Promise<void> {
        this.countMinTitle = await TranslationService.translate('Translatable#Count Min');
        this.countMinDescription = await TranslationService.translate('Translatable#The minimum number of items which are available for input if field is shown in edit mode.');

        this.countMaxTitle = await TranslationService.translate('Translatable#Count Max');
        this.countMaxDescription = await TranslationService.translate('Translatable#The maximum number of array or selectable items for this field. if field is shown in edit mode.');

        this.countDefaultTitle = await TranslationService.translate('Translatable#Count Default');
        this.countDefaultDescription = await TranslationService.translate('Translatable#If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.');

        this.itemSeparatorTitle = await TranslationService.translate('Translatable#Item Separator');
        this.itemSeparatorDescription = await TranslationService.translate('Translatable#If field contains multiple values, single values are concatenated by this separator symbol/s.');

        this.defaultValueTitle = await TranslationService.translate('Translatable#Default Value');
        this.defaultValueDescription = await TranslationService.translate('Translatable#The initial value of the field if shown in edit mode for the first time. Applies to first item of array only.');

        await this.registerSchemaForText();
        await this.registerSchemaForTextArea();
        await this.registerSchemaForDate();
        await this.registerSchemaForDateTime();
        await this.registerSchemaForSelection();
        await this.registerSchemaForCheckList();
        DynamicFieldService.getInstance().registerConfigSchemaHandler(
            DynamicFieldTypes.CI_REFERENCE, this.getSchemaForCIReference.bind(this)
        );
        this.registerSchemaForTable();
    }

    private async registerSchemaForText(): Promise<void> {

        const regExListTitle: string = await TranslationService.translate('Translatable#RegEx List');
        const regExListDescription: string = await TranslationService.translate('Translatable#A list of RegEx which are applied to values entered before submitting if field is shown in edit mode. The RegExError is shown if a RegEx does NOT match the value entered.');
        const regEx: string = await TranslationService.translate('Translatable#RegEx');
        const regExError: string = await TranslationService.translate('Translatable#RegExErrorMessage');

        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: this.countMinTitle,
                    description: this.countMinDescription,
                    type: 'integer'
                },
                CountMax: {
                    title: this.countMaxTitle,
                    description: this.countMaxDescription,
                    type: 'integer'
                },
                CountDefault: {
                    title: this.countDefaultTitle,
                    description: this.countDefaultDescription,
                    type: 'integer'
                },
                ItemSeparator: {
                    title: this.itemSeparatorTitle,
                    description: this.itemSeparatorDescription,
                    type: 'string'
                },
                DefaultValue: {
                    title: this.defaultValueTitle,
                    description: this.defaultValueDescription,
                    type: 'string'
                },
                RegExList: {
                    title: regExListTitle,
                    description: regExListDescription,
                    type: 'array',
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

    private async registerSchemaForTextArea(): Promise<void> {

        const regExListTitle: string = await TranslationService.translate('Translatable#RegEx List');
        const regExListDescription: string = await TranslationService.translate('Translatable#A list of RegEx which are applied to values entered before submitting if field is shown in edit mode. The RegExError is shown if a RegEx does NOT match the value entered.');
        const regEx: string = await TranslationService.translate('Translatable#RegEx');
        const regExError: string = await TranslationService.translate('Translatable#RegExErrorMessage');

        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: this.countMinTitle,
                    description: this.countMinDescription,
                    type: 'integer'
                },
                CountMax: {
                    title: this.countMaxTitle,
                    description: this.countMaxDescription,
                    type: 'integer'
                },
                CountDefault: {
                    title: this.countDefaultTitle,
                    description: this.countDefaultDescription,
                    type: 'integer'
                },
                ItemSeparator: {
                    title: this.itemSeparatorTitle,
                    description: this.itemSeparatorDescription,
                    type: 'string'
                },
                DefaultValue: {
                    title: this.defaultValueTitle,
                    description: this.defaultValueDescription,
                    type: 'string'
                },
                RegExList: {
                    title: regExListTitle,
                    description: regExListDescription,
                    type: 'array',
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
                },
                required: ['CountMin', 'CountMax', 'CountDefault']
            }
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.TEXT_AREA, schema);
    }

    private async registerSchemaForDate(): Promise<void> {

        const yearsInFuture = await TranslationService.translate('Translatable#Years in Future');
        const yearsInPast = await TranslationService.translate('Translatable#Years in Past');
        const dateRestriction = await TranslationService.translate('Translatable#Date Restriction');

        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: this.countMinTitle,
                    description: this.countMinDescription,
                    type: 'integer'
                },
                CountMax: {
                    title: this.countMaxTitle,
                    description: this.countMaxDescription,
                    type: 'integer'
                },
                CountDefault: {
                    title: this.countDefaultTitle,
                    description: this.countDefaultDescription,
                    type: 'integer'
                },
                ItemSeparator: {
                    title: this.itemSeparatorTitle,
                    description: this.itemSeparatorDescription,
                    type: 'string'
                },
                DefaultValue: {
                    title: this.defaultValueTitle,
                    description: this.defaultValueDescription,
                    type: 'string'
                },
                YearsInFuture: {
                    title: yearsInFuture,
                    description: '',
                    type: 'integer'
                },
                YearsInPast: {
                    title: yearsInPast,
                    description: '',
                    type: 'integer'
                },
                DateRestriction: {
                    title: dateRestriction,
                    type: 'string',
                    default: 'none',
                    enum: [
                        'none',
                        'DisableFutureDates',
                        'DisablePastDates'
                    ]
                }
            },
            required: ['CountMin', 'CountMax', 'CountDefault']
        };
        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.DATE, schema);
    }

    private async registerSchemaForDateTime(): Promise<void> {

        const defaultValueDescription = await TranslationService.translate('Translatable#This value defines the offset (in seconds) to the very moment in which the field is initially displayed for input. Leave empty if the field should not hold any value upon first input. For instance, enter 3600 if the field should be initialized with "now+1h" or enter 86400 if the field should be initialized with "now+24h".');
        const yearsInFuture = await TranslationService.translate('Translatable#Years in Future');
        const yearsInPast = await TranslationService.translate('Translatable#Years in Past');
        const dateRestriction = await TranslationService.translate('Translatable#Date Restriction');

        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: this.countMinTitle,
                    description: this.countMinDescription,
                    type: 'integer'
                },
                CountMax: {
                    title: this.countMaxTitle,
                    description: this.countMaxDescription,
                    type: 'integer'
                },
                CountDefault: {
                    title: this.countDefaultTitle,
                    description: this.countDefaultDescription,
                    type: 'integer'
                },
                ItemSeparator: {
                    title: this.itemSeparatorTitle,
                    description: this.itemSeparatorDescription,
                    type: 'string'
                },
                DefaultValue: {
                    title: this.defaultValueTitle,
                    description: defaultValueDescription,
                    type: 'string'
                },
                YearsInFuture: {
                    title: yearsInFuture,
                    description: '',
                    type: 'integer'
                },
                YearsInPast: {
                    title: yearsInPast,
                    description: '',
                    type: 'integer'
                },
                DateRestriction: {
                    title: dateRestriction,
                    type: 'string',
                    default: 'none',
                    enum: [
                        'none',
                        'DisableFutureDates',
                        'DisablePastDates'
                    ]
                }
            },
            required: ['CountMin', 'CountMax', 'CountDefault']
        };
        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.DATE_TIME, schema);
    }

    private async registerSchemaForSelection(): Promise<void> {

        const translatableValues = await TranslationService.translate('Translatable#Translatable Values');
        const possibleValues = await TranslationService.translate('Translatable#Possible Values');

        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: this.countMinTitle,
                    description: this.countMinDescription,
                    type: 'integer'
                },
                CountMax: {
                    title: this.countMaxTitle,
                    description: this.countMaxDescription,
                    type: 'integer'
                },
                CountDefault: {
                    title: this.countDefaultTitle,
                    description: this.countDefaultDescription,
                    type: 'integer'
                },
                ItemSeparator: {
                    title: this.itemSeparatorTitle,
                    description: this.itemSeparatorDescription,
                    type: 'string'
                },
                DefaultValue: {
                    title: this.defaultValueTitle,
                    description: this.defaultValueDescription,
                    type: 'string'
                },
                TranslatableValues: {
                    title: translatableValues,
                    description: '',
                    type: 'boolean',
                    format: 'checkbox'
                },
                PossibleValues: {
                    title: possibleValues,
                    description: '',
                    type: 'array',
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
                }
            },
            required: ['CountMin', 'CountMax', 'CountDefault']
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.SELECTION, schema);
    }

    private async registerSchemaForCheckList(): Promise<void> {

        const checkListItemTitle = await TranslationService.translate('Translatable#Checklist Item');
        const itemId = await TranslationService.translate('Translatable#Id');
        const itemTitle = await TranslationService.translate('Translatable#Title');
        const itemDescription = await TranslationService.translate('Translatable#Description');
        const itemInput = await TranslationService.translate('Translatable#Input');
        const itemValue = await TranslationService.translate('Translatable#Value');
        const itemSub = await TranslationService.translate('Translatable#Sub');

        const schema = {
            type: 'object',
            definitions: {
                CheckListItem: {
                    title: checkListItemTitle,
                    description: '',
                    type: 'array',
                    required: false,
                    items: {
                        type: 'object',
                        properties: {
                            id: {
                                title: itemId,
                                type: 'string'
                            },
                            title: {
                                title: itemTitle,
                                type: 'string'
                            },
                            description: {
                                title: itemDescription,
                                type: 'string'
                            },
                            input: {
                                title: itemInput,
                                type: 'string',
                                default: 'ChecklistState',
                                enum: [
                                    'Text',
                                    'TextArea',
                                    'ChecklistState'
                                ]
                            },
                            value: {
                                title: itemValue,
                                type: 'string'
                            },
                            sub: {
                                title: itemSub,
                                $ref: '#/definitions/CheckListItem'
                            }
                        }
                    }
                }
            },
            properties: {
                DefaultValue: {
                    title: this.defaultValueTitle,
                    $ref: '#/definitions/CheckListItem'
                }
            }
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.CHECK_LIST, schema);
    }

    private async getSchemaForCIReference(): Promise<any> {

        const states = await CMDBService.getInstance().getDeploymentStates();
        const classes = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS
        );

        const deploymentStatesTitle = await TranslationService.translate('Translatable#Deployment States');
        const deploymentStatesDescription = await TranslationService.translate('Translatable#This configuration defines which Deployment States are subject to this selection. Please enter DeploymentStates.');
        const incidentStatesTitle = await TranslationService.translate('Translatable#Incident States');
        const incidentStatesDescription = await TranslationService.translate('Translatable#This configuration defines which Asset Classes are subject to this selection. Please enter Classes.');

        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: this.countMinTitle,
                    description: this.countMinDescription,
                    type: 'integer'
                },
                CountMax: {
                    title: this.countMaxTitle,
                    description: this.countMaxDescription,
                    type: 'integer'
                },
                CountDefault: {
                    title: this.countDefaultTitle,
                    description: this.countDefaultDescription,
                    type: 'integer'
                },
                ItemSeparator: {
                    title: this.itemSeparatorTitle,
                    description: this.itemSeparatorDescription,
                    type: 'string'
                },
                DefaultValue: {
                    title: this.defaultValueTitle,
                    description: this.defaultValueDescription,
                    type: 'string'
                },
                DeploymentStates: {
                    type: 'array',
                    format: 'select',
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
                    format: 'select',
                    uniqueItems: true,
                    title: incidentStatesTitle,
                    description: incidentStatesDescription,
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

    private async registerSchemaForTable(): Promise<void> {

        const columns = await TranslationService.translate('Translatable#Columns');
        const rowsMinTitle = await TranslationService.translate('Translatable#Number of rows (min)');
        const rowsMinDescription = await TranslationService.translate('Translatable#Specifies the minimum number of rows that the table has to display. It is not possible to delete rows below the minimum number of rows.\n Values less than 1 are not possible.');
        const rowsinitTitle = await TranslationService.translate('Translatable#Number of rows (init)');
        const rowsinitDescription = await TranslationService.translate('Translatable#Specifies the initial number of rows that the table should display if there are no entries.\n The initial must not be smaller than the minimum and larger than the maximum of the number of rows.\n Values less than 1 are not possible.');
        const rowsMaxTitle = await TranslationService.translate('Translatable#Number of rows (max)');
        const rowsMaxDescription = await TranslationService.translate('Translatable#Specifies the maximum number of rows in the table that can be displayed/added. Values less than 1 are not possible.');
        const translatableColumns = await TranslationService.translate('Translatable#Translatable Columns');

        const schema = {
            $schema: 'http://json-schema.org/draft-03/schema#',
            type: 'object',
            properties: {
                Columns: {
                    title: columns,
                    description: '',
                    type: 'array',
                    required: true,
                    items: {
                        type: 'string'
                    }
                },
                RowsMin: {
                    title: rowsMinTitle,
                    description: rowsMinDescription,
                    type: 'integer',
                    default: '1',
                    minimum: '1',
                    required: true
                },
                RowsInit: {
                    title: rowsinitTitle,
                    description: rowsinitDescription,
                    type: 'integer',
                    default: '1',
                    minimum: '1',
                    required: true
                },
                RowsMax: {
                    title: rowsMaxTitle,
                    description: rowsMaxDescription,
                    type: 'integer',
                    default: '1',
                    minimum: '1',
                    required: true
                },
                TranslatableColumn: {
                    title: translatableColumns,
                    description: '',
                    type: 'boolean',
                    format: 'checkbox',
                    required: false
                },
            }
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.TABLE, schema);
    }
}
