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

export class UIModule implements IUIModule {

    public priority: number = 400;

    public name: string = 'DynamicFieldsUIModule';

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

        this.registerSchemas();
    }

    // tslint:disable:max-line-length
    private registerSchemas(): void {
        this.registerSchemaForText();
        this.registerSchemaForTextArea();
        this.registerSchemaForDate();
        this.registerSchemaForDateTime();
        this.registerSchemaForSelection();
        this.registerSchemaForCheckList();
        DynamicFieldService.getInstance().registerConfigSchemaHandler(DynamicFieldTypes.CI_REFERENCE, this.getSchemaForCIReference.bind(this));
    }

    private registerSchemaForText(): void {
        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: 'Count Min',
                    description: 'The minimum number of items which are available for input if field is shown in edit mode.',
                    type: 'integer'
                },
                CountMax: {
                    title: 'Count Max',
                    description: 'The maximum number of array or selectable items for this field. if field is shown in edit mode.',
                    type: 'integer'
                },
                CountDefault: {
                    title: 'Count Default',
                    description: 'If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.',
                    type: 'integer'
                },
                ItemSeparator: {
                    title: 'Item Separator',
                    description: 'If field contains multiple values, single values are concatenated by this separator symbol/s.',
                    type: 'string'
                },
                DefaultValue: {
                    title: 'Default Value',
                    description: 'The initial value of the field if shown in edit mode for the first time. Applies to first item of array only.',
                    type: 'string'
                },
                RegExList: {
                    title: 'RegEx List',
                    description: 'A list of RegEx which are applied to values entered before submitting if field is shown in edit mode. The RegExError is shown if a RegEx does NOT match the value entered.',
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            Value: {
                                title: 'RegEx',
                                type: 'string'
                            },
                            ErrorMessage: {
                                title: 'RegExErrorMessage',
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

    private registerSchemaForTextArea(): void {
        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: 'Count Min',
                    description: 'The minimum number of items which are available for input if field is shown in edit mode.',
                    type: 'integer'
                },
                CountMax: {
                    title: 'Count Max',
                    description: 'The maximum number of array or selectable items for this field. if field is shown in edit mode.',
                    type: 'integer'
                },
                CountDefault: {
                    title: 'Count Default',
                    description: 'If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.',
                    type: 'integer'
                },
                ItemSeparator: {
                    title: 'Item Separator',
                    description: 'If field contains multiple values, single values are concatenated by this separator symbol/s.',
                    type: 'string'
                },
                DefaultValue: {
                    title: 'Default Value',
                    description: 'The initial value of the field if shown in edit mode for the first time. Applies to first item of array only.',
                    type: 'string'
                },
                RegExList: {
                    title: 'RegEx List',
                    description: 'A list of RegEx which are applied to values entered before submitting if field is shown in edit mode. The RegExError is shown if a RegEx does NOT match the value entered.',
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            Value: {
                                title: 'RegEx',
                                type: 'string'
                            },
                            ErrorMessage: {
                                title: 'RegExErrorMessage',
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

    private registerSchemaForDate(): void {
        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: 'Count Min',
                    description: 'The minimum number of items which are available for input if field is shown in edit mode.',
                    type: 'integer'
                },
                CountMax: {
                    title: 'Count Max',
                    description: 'The maximum number of array or selectable items for this field. if field is shown in edit mode.',
                    type: 'integer'
                },
                CountDefault: {
                    title: 'Count Default',
                    description: 'If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.',
                    type: 'integer'
                },
                ItemSeparator: {
                    title: 'Item Separator',
                    description: 'If field contains multiple values, single values are concatenated by this separator symbol/s.',
                    type: 'string'
                },
                DefaultValue: {
                    title: 'Default Value',
                    description: 'This value defines the offset (in days) to the very moment in which the field is initially displayed for input. Leave empty if the field should not hold any value upon first input. Keep in mind that date-fields are normalized to time "00:00:00", hence enter 1 in order to initialize the field with "tomorrows" date.',
                    type: 'integer'
                },
                YearsInFuture: {
                    title: 'Years in Future',
                    description: '',
                    type: 'integer'
                },
                YearsInPast: {
                    title: 'Years in Past',
                    description: '',
                    type: 'integer'
                },
                DateRestriction: {
                    title: 'Date Restriction',
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

    private registerSchemaForDateTime(): void {
        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: 'Count Min',
                    description: 'The minimum number of items which are available for input if field is shown in edit mode.',
                    type: 'integer'
                },
                CountMax: {
                    title: 'Count Max',
                    description: 'The maximum number of array or selectable items for this field. if field is shown in edit mode.',
                    type: 'integer'
                },
                CountDefault: {
                    title: 'Count Default',
                    description: 'If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.',
                    type: 'integer'
                },
                ItemSeparator: {
                    title: 'Item Separator',
                    description: 'If field contains multiple values, single values are concatenated by this separator symbol/s.',
                    type: 'string'
                },
                DefaultValue: {
                    title: 'Default Value',
                    description: 'This value defines the offset (in seconds) to the very moment in which the field is initially displayed for input. Leave empty if the field should not hold any value upon first input. For instance, enter 3600 if the field should be initialized with "now+1h" or enter 86400 if the field should be initialized with "now+24h".',
                    type: 'integer'
                },
                YearsInFuture: {
                    title: 'Years in Future',
                    description: '',
                    type: 'integer'
                },
                YearsInPast: {
                    title: 'Years in Past',
                    description: '',
                    type: 'integer'
                },
                DateRestriction: {
                    title: 'Date Restriction',
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

    private registerSchemaForSelection(): void {
        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: 'Count Min',
                    description: 'The minimum number of items which are available for input if field is shown in edit mode.',
                    type: 'integer'
                },
                CountMax: {
                    title: 'Count Max',
                    description: 'The maximum number of array or selectable items for this field. if field is shown in edit mode.',
                    type: 'integer'
                },
                CountDefault: {
                    title: 'Count Default',
                    description: 'If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.',
                    type: 'integer'
                },
                ItemSeparator: {
                    title: 'Item Separator',
                    description: 'If field contains multiple values, single values are concatenated by this separator symbol/s.',
                    type: 'string'
                },
                DefaultValue: {
                    title: 'Default Value',
                    description: 'The initial value of the field if shown in edit mode for the first time. Applies to first item of array only. Use the key of the possible value.',
                    type: 'string'
                },
                TranslatableValues: {
                    title: 'Translatable Values',
                    description: '',
                    type: 'boolean',
                    format: 'checkbox'
                },
                PossibleValues: {
                    title: 'Possible Values',
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

    private registerSchemaForCheckList(): void {
        const schema = {
            type: 'object',
            definitions: {
                CheckListItem: {
                    title: 'Checklist Item',
                    description: '',
                    type: 'array',
                    required: false,
                    items: {
                        type: 'object',
                        properties: {
                            id: {
                                title: 'Id',
                                type: 'string'
                            },
                            title: {
                                title: 'Title',
                                type: 'string'
                            },
                            description: {
                                title: 'Description',
                                type: 'string'
                            },
                            input: {
                                title: 'Input',
                                type: 'string',
                                default: 'ChecklistState',
                                enum: [
                                    'Text',
                                    'ChecklistState'
                                ]
                            },
                            value: {
                                title: 'Value',
                                type: 'string'
                            },
                            sub: {
                                title: 'Sub',
                                $ref: '#/definitions/CheckListItem'
                            }
                        }
                    }
                }
            },
            properties: {
                DefaultValue: {
                    title: 'Default Value',
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

        const schema = {
            type: 'object',
            properties: {
                CountMin: {
                    title: 'Count Min',
                    description: 'The minimum number of items which are available for input if field is shown in edit mode.',
                    type: 'integer'
                },
                CountMax: {
                    title: 'Count Max',
                    description: 'The maximum number of array or selectable items for this field. if field is shown in edit mode.',
                    type: 'integer'
                },
                CountDefault: {
                    title: 'Count Default',
                    description: 'If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.',
                    type: 'integer'
                },
                ItemSeparator: {
                    title: 'Item Separator',
                    description: 'If field contains multiple values, single values are concatenated by this separator symbol/s.',
                    type: 'string'
                },
                DefaultValue: {
                    title: 'Default Value',
                    description: 'The initial value of the field if shown in edit mode for the first time. Applies to first item of array only.',
                    type: 'string'
                },
                DeploymentStates: {
                    type: 'array',
                    format: 'select',
                    uniqueItems: true,
                    description: 'This configuration defines which Deployment States are subject to this selection. Please enter DeploymentStates.',
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
                    description: 'This configuration defines which Asset Classes are subject to this selection. Please enter Classes.',
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
