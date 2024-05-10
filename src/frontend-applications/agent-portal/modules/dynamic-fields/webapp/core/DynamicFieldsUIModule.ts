/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
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
import { ObjectIconService } from '../../../icon/webapp/core';
import { DynamicFieldDuplicateAction } from './DynamicFieldDuplicateAction';
import { DynamicFieldDeleteAction } from './DynamicFieldDeleteAction';

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

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(DynamicFieldService.getInstance());
        ServiceRegistry.registerServiceInstance(DynamicFieldFormService.getInstance());

        PlaceholderService.getInstance().registerPlaceholderHandler(DynamicFieldValuePlaceholderHandler.getInstance());

        TableFactoryService.getInstance().registerFactory(new DynamicFieldTableFactory());

        LabelService.getInstance().registerLabelProvider(new DynamicFieldLabelProvider());
        LabelService.getInstance().registerLabelProvider(new DynamicFieldTypeLabelProvider());

        ActionFactory.getInstance().registerAction('dynamic-field-create-action', DynamicFieldCreateAction);
        ActionFactory.getInstance().registerAction('dynamic-field-duplicate-action', DynamicFieldDuplicateAction);
        ActionFactory.getInstance().registerAction('dynamic-field-delete-action', DynamicFieldDeleteAction);

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

        this.registerSchemas();
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

    // tslint:disable:max-line-length
    private async registerSchemas(): Promise<void> {
        this.countMinTitle = await TranslationService.translate('Translatable#Count Min');
        this.countMinDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_CountMin');

        this.countMaxTitle = await TranslationService.translate('Translatable#Count Max');
        this.countMaxDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_CountMax');

        this.countDefaultTitle = await TranslationService.translate('Translatable#Count Default');
        this.countDefaultDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_CountDefault');

        this.itemSeparatorTitle = await TranslationService.translate('Translatable#Item Separator');
        this.itemSeparatorDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_ItemSeparator');

        this.defaultValueTitle = await TranslationService.translate('Translatable#Default Value');
        this.defaultValueDescription = await TranslationService.translate('Translatable#Admin_DynamicField_Config_Value');

        this.registerSchemaForText();
        this.registerSchemaForTextArea();
        this.registerSchemaForDate();
        this.registerSchemaForDateTime();
        this.registerSchemaForSelection();
        this.registerSchemaForCheckList();
        DynamicFieldService.getInstance().registerConfigSchemaHandler(
            DynamicFieldTypes.CI_REFERENCE, this.getSchemaForCIReference.bind(this)
        );
        this.registerSchemaForTable();
    }

    // eslint-disable-next-line max-lines-per-function
    private async registerSchemaForText(): Promise<void> {

        const regExListTitle: string = await TranslationService.translate('Translatable#RegEx List');
        const regExListDescription: string = await TranslationService.translate('Translatable#Admin_DynamicField_Config_RegexList');
        const regEx: string = await TranslationService.translate('Translatable#RegEx');
        const regExError: string = await TranslationService.translate('Translatable#RegExErrorMessage');

        const schema = {
            type: 'object',
            format: 'grid-strict',
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
                    type: 'string',
                    options: {
                        grid_break: true
                    }
                },
                DefaultValue: {
                    title: this.defaultValueTitle,
                    description: this.defaultValueDescription,
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

    // eslint-disable-next-line max-lines-per-function
    private async registerSchemaForTextArea(): Promise<void> {

        const regExListTitle: string = await TranslationService.translate('Translatable#RegEx List');
        const regExListDescription: string = await TranslationService.translate('Translatable#Admin_DynamicField_Config_RegexList');
        const regEx: string = await TranslationService.translate('Translatable#RegEx');
        const regExError: string = await TranslationService.translate('Translatable#RegExErrorMessage');

        const schema = {
            type: 'object',
            format: 'grid-strict',
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
                    type: 'string',
                    options: {
                        grid_break: true
                    }
                },
                DefaultValue: {
                    title: this.defaultValueTitle,
                    description: this.defaultValueDescription,
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

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.TEXT_AREA, schema);
    }

    // eslint-disable-next-line max-lines-per-function
    private async registerSchemaForDate(): Promise<void> {

        const yearsInFuture = await TranslationService.translate('Translatable#Years in Future');
        const yearsInPast = await TranslationService.translate('Translatable#Years in Past');
        const dateRestriction = await TranslationService.translate('Translatable#Date Restriction');

        const schema = {
            type: 'object',
            format: 'grid-strict',
            properties: {
                CountMin: {
                    title: this.countMinTitle,
                    description: this.countMinDescription,
                    type: 'integer'
                },
                CountMax: {
                    title: this.countMaxTitle,
                    description: this.countMaxDescription,
                    type: 'integer',
                },
                CountDefault: {
                    title: this.countDefaultTitle,
                    description: this.countDefaultDescription,
                    type: 'integer',
                    options: {
                        grid_break: true
                    }
                },
                ItemSeparator: {
                    title: this.itemSeparatorTitle,
                    description: this.itemSeparatorDescription,
                    type: 'string'
                },
                DefaultValue: {
                    title: this.defaultValueTitle,
                    description: this.defaultValueDescription,
                    type: 'string',
                    options: {
                        grid_break: true
                    }
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
                    format: 'select',
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

    // eslint-disable-next-line max-lines-per-function
    private async registerSchemaForDateTime(): Promise<void> {

        const defaultValueDescription = await TranslationService.translate('Translatable#Admin_DynamicFieldDateTime_DefaultValue_Description');
        const yearsInFuture = await TranslationService.translate('Translatable#Years in Future');
        const yearsInPast = await TranslationService.translate('Translatable#Years in Past');
        const dateRestriction = await TranslationService.translate('Translatable#Date Restriction');

        const schema = {
            'type': 'object',
            'format': 'grid-strict',
            'properties': {
                'CountMin': {
                    'title': this.countMinTitle,
                    'description': this.countMinDescription,
                    'type': 'integer'
                },
                'CountMax': {
                    'title': this.countMaxTitle,
                    'description': this.countMaxDescription,
                    'type': 'integer'
                },
                'CountDefault': {
                    'title': this.countDefaultTitle,
                    'description': this.countDefaultDescription,
                    'type': 'integer',
                    'options': {
                        'grid_break': true
                    }
                },
                'ItemSeparator': {
                    'title': this.itemSeparatorTitle,
                    'description': this.itemSeparatorDescription,
                    'type': 'string'
                },
                'DefaultValue': {
                    'title': this.defaultValueTitle,
                    'description': defaultValueDescription,
                    'type': 'string',
                    'options': {
                        'grid_break': true
                    }
                },
                'YearsInFuture': {
                    'title': yearsInFuture,
                    'description': '',
                    'type': 'integer'
                },
                'YearsInPast': {
                    'title': yearsInPast,
                    'description': '',
                    'type': 'integer'
                },
                'DateRestriction': {
                    'title': dateRestriction,
                    'type': 'string',
                    'default': 'none',
                    'enum': [
                        'none',
                        'DisableFutureDates',
                        'DisablePastDates'
                    ]
                }
            },
            'required': [
                'CountMin',
                'CountMax',
                'CountDefault'
            ]
        };
        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.DATE_TIME, schema);
    }

    // eslint-disable-next-line max-lines-per-function
    private async registerSchemaForSelection(): Promise<void> {

        const translatableValues = await TranslationService.translate('Translatable#Translatable Values');
        const possibleValues = await TranslationService.translate('Translatable#Possible Values');

        const schema = {
            type: 'object',
            format: 'grid',
            properties: {
                CountMin: {
                    title: this.countMinTitle,
                    description: this.countMinDescription,
                    type: 'integer',
                    options: {
                        grid_columns: 3
                    }
                },
                CountMax: {
                    title: this.countMaxTitle,
                    description: this.countMaxDescription,
                    type: 'integer',
                    options: {
                        grid_columns: 3
                    }
                },
                CountDefault: {
                    title: this.countDefaultTitle,
                    description: this.countDefaultDescription,
                    type: 'integer',
                    options: {
                        grid_columns: 3
                    }
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
                }
            },
            required: ['CountMin', 'CountMax', 'CountDefault']
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.SELECTION, schema);
    }

    // eslint-disable-next-line max-lines-per-function
    private async registerSchemaForCheckList(): Promise<void> {

        const checkListItemTitle = await TranslationService.translate('Translatable#Checklist Item');
        const itemId = await TranslationService.translate('Translatable#Id');
        const itemTitle = await TranslationService.translate('Translatable#Title');
        const itemDescription = await TranslationService.translate('Translatable#Description');
        const itemInput = await TranslationService.translate('Translatable#Input');
        const itemValue = await TranslationService.translate('Translatable#Value');
        const itemSub = await TranslationService.translate('Translatable#Sub');

        const checklistState = await TranslationService.translate('Translatable#Checklist State');
        const label = await TranslationService.translate('Translatable#Label');
        const done = await TranslationService.translate('Translatable#Done');
        const doneDescription = await TranslationService.translate('Translatable#If true, the value will increase the checklist counter.');

        let icons = await ObjectIconService.getInstance().getAvailableIcons(
            true, true, false
        );
        icons = [
            '',
            ...icons?.filter((i) => typeof i === 'string').sort((a, b) => a.toString().localeCompare(b.toString()))
        ];

        const schema = {
            type: 'object',
            title: 'Checklist',
            definitions: {
                CommonChecklistState: {
                    title: checklistState,
                    type: 'array',
                    required: false,
                    format: 'table',
                    items: {
                        type: 'object',
                        properties: {
                            value: {
                                title: label,
                                type: 'string',
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            icon: {
                                title: 'Icon',
                                type: 'string',
                                uniqueItems: true,
                                enum: icons,
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            done: {
                                title: done,
                                description: doneDescription,
                                type: 'boolean',
                                format: 'checkbox',
                                default: 1,
                                options: {
                                    'grid_columns': 4
                                }
                            }
                        }
                    }
                },
                CheckListItem: {
                    title: checkListItemTitle,
                    description: '',
                    type: 'array',
                    required: false,
                    format: 'tabs',
                    items: {
                        type: 'object',
                        properties: {
                            id: {
                                title: itemId,
                                type: 'string',
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            title: {
                                title: itemTitle,
                                type: 'string',
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            description: {
                                title: itemDescription,
                                type: 'string',
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            input: {
                                title: itemInput,
                                type: 'string',
                                default: 'ChecklistState',
                                enum: [
                                    'Text',
                                    'TextArea',
                                    'ChecklistState'
                                ],
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            value: {
                                dependencies: {
                                    input: ['Text', 'TextArea']
                                },
                                watch: {
                                    input: 'input'
                                },
                                title: itemValue,
                                type: 'string'
                            },
                            inputStates: {
                                $ref: '#/definitions/CommonChecklistState'
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
                    $ref: '#/definitions/CheckListItem'
                }
            }
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.CHECK_LIST, schema);
    }

    // eslint-disable-next-line max-lines-per-function
    private async getSchemaForCIReference(): Promise<any> {

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
                    title: this.countMinTitle,
                    description: this.countMinDescription,
                    type: 'integer',
                    options: {
                        grid_columns: 3
                    }
                },
                CountMax: {
                    title: this.countMaxTitle,
                    description: this.countMaxDescription,
                    type: 'integer',
                    options: {
                        grid_columns: 3
                    }
                },
                CountDefault: {
                    title: this.countDefaultTitle,
                    description: this.countDefaultDescription,
                    type: 'integer',
                    options: {
                        grid_columns: 3
                    }
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

    // eslint-disable-next-line max-lines-per-function
    private async registerSchemaForTable(): Promise<void> {

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
