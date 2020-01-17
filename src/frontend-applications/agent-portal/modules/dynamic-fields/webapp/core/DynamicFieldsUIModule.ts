/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { ServiceRegistry } from "../../../base-components/webapp/core/ServiceRegistry";
import { DynamicFieldService } from "./DynamicFieldService";
import { DynamicFieldBrowserFactory } from "./DynamicFieldBrowserFactory";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { FactoryService } from "../../../base-components/webapp/core/FactoryService";
import { TableFactoryService } from "../../../base-components/webapp/core/table";
import { LabelService } from "../../../base-components/webapp/core/LabelService";
import { DynamicFieldLabelProvider } from "./DynamicFieldLabelProvider";
import { DynamicFieldTableFactory } from "./DynamicFieldTableFactory";
import { ActionFactory } from "../../../base-components/webapp/core/ActionFactory";
import { DynamicFieldCreateAction } from "./DynamicFieldCreateAction";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { NewDynamicFieldDialogContext } from "./NewDynamicFieldDialogContext";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextService } from "../../../base-components/webapp/core/ContextService";
import { DynamicFieldFormService } from "./DynamicFieldFormService";
import { EditDynamicFieldDialogContext } from "./EditDynamicFieldDialogContext";
import { DynamicFieldType } from "../../model/DynamicFieldType";
import { FormValidationService } from "../../../base-components/webapp/core/FormValidationService";
import { DynamicFieldTextValidator } from "./DynamicFieldTextValidator";
import { DynamicFieldDateTimeValidator } from "./DynamicFieldDateTimeValidator";

export class UIModule implements IUIModule {

    public priority: number = 400;

    public name: string = 'DynamicFieldsUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(DynamicFieldService.getInstance());
        ServiceRegistry.registerServiceInstance(DynamicFieldFormService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.DYNAMIC_FIELD, DynamicFieldBrowserFactory.getInstance()
        );

        TableFactoryService.getInstance().registerFactory(new DynamicFieldTableFactory());

        LabelService.getInstance().registerLabelProvider(new DynamicFieldLabelProvider());

        ActionFactory.getInstance().registerAction('dynamic-field-create-action', DynamicFieldCreateAction);

        const newDynamicFieldContext = new ContextDescriptor(
            NewDynamicFieldDialogContext.CONTEXT_ID, [KIXObjectType.DYNAMIC_FIELD],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-dynamic-field-dialog', ['dynamicfields'], NewDynamicFieldDialogContext
        );
        await ContextService.getInstance().registerContext(newDynamicFieldContext);

        const editDynamicFieldContext = new ContextDescriptor(
            EditDynamicFieldDialogContext.CONTEXT_ID, [KIXObjectType.DYNAMIC_FIELD],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-dynamic-field-dialog', ['dynamicfields'], EditDynamicFieldDialogContext
        );
        await ContextService.getInstance().registerContext(editDynamicFieldContext);

        FormValidationService.getInstance().registerValidator(new DynamicFieldTextValidator());
        FormValidationService.getInstance().registerValidator(new DynamicFieldDateTimeValidator());

        this.registerSchemas();
    }


    private registerSchemas(): void {
        this.registerSchemaForText();
        this.registerSchemaForTextArea();
        this.registerSchemaForDate();
        this.registerSchemaForDateTime();
        this.registerSchemaForSelection();
    }

    // tslint:disable:max-line-length
    private registerSchemaForText(): void {
        const schema = {
            $schema: "http://json-schema.org/draft-03/schema#",
            type: "object",
            properties: {
                ValueTTL: {
                    title: "TTL",
                    description: "Field value cleared after ValueTTL seconds after the field value is set.",
                    type: "string",
                    required: true
                },
                CountMin: {
                    title: "Count Min",
                    description: "The minimum number of items which are available for input if field is shown in edit mode.",
                    type: "integer",
                    required: true
                },
                CountMax: {
                    title: "Count Max",
                    description: "The maximum number of array or selectable items for this field. if field is shown in edit mode.",
                    type: "integer",
                    required: true
                },
                CountDefault: {
                    title: "Count Default",
                    description: "If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.",
                    type: "integer",
                    required: true
                },
                ItemSeparator: {
                    title: "Item Separator",
                    description: "If field contains multiple values, single values are concatenated by this separator symbol/s.",
                    type: "string",
                    required: false
                },
                DefaultValue: {
                    title: "Default Value",
                    description: "The initial value of the field if shown in edit mode for the first time. Applies to first item of array only.",
                    type: "string",
                    required: false
                },
                Link: {
                    title: "Link",
                    description: "An URL which may use placedholder referring to this fields value (or any other object property) as parameter, i.e. https://localhost/Field.Value.",
                    type: "string",
                    required: false
                },
                RegExList: {
                    title: "RegEx List",
                    description: "A list of RegEx which are applied to values entered before submitting if field is shown in edit mode. The RegExError is shown if a RegEx does NOT match the value entered.",
                    type: "array",
                    required: false,
                    items: {
                        type: "object",
                        properties: {
                            RegEx: {
                                title: "RegEx",
                                type: "string"
                            },
                            RegExError: {
                                title: "RegExError",
                                type: "string"
                            }
                        }
                    }
                }
            }
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldType.TEXT, schema);
    }

    private registerSchemaForTextArea(): void {
        const schema = {
            $schema: "http://json-schema.org/draft-03/schema#",
            type: "object",
            properties: {
                ValueTTL: {
                    title: "TTL",
                    description: "Field value cleared after ValueTTL seconds after the field value is set.",
                    type: "string",
                    required: true
                },
                CountMin: {
                    title: "Count Min",
                    description: "The minimum number of items which are available for input if field is shown in edit mode.",
                    type: "integer",
                    required: true
                },
                CountMax: {
                    title: "Count Max",
                    description: "The maximum number of array or selectable items for this field. if field is shown in edit mode.",
                    type: "integer",
                    required: true
                },
                CountDefault: {
                    title: "Count Default",
                    description: "If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.",
                    type: "integer",
                    required: true
                },
                ItemSeparator: {
                    title: "Item Separator",
                    description: "If field contains multiple values, single values are concatenated by this separator symbol/s.",
                    type: "string",
                    required: false
                },
                DefaultValue: {
                    title: "Default Value",
                    description: "The initial value of the field if shown in edit mode for the first time. Applies to first item of array only.",
                    type: "string",
                    required: false
                },
                Link: {
                    title: "Link",
                    description: "An URL which may use placedholder referring to this fields value (or any other object property) as parameter, i.e. https://localhost/Field.Value.",
                    type: "string",
                    required: false
                },
                RegExList: {
                    title: "RegEx List",
                    description: "A list of RegEx which are applied to values entered before submitting if field is shown in edit mode. The RegExError is shown if a RegEx does NOT match the value entered.",
                    type: "array",
                    required: false,
                    items: {
                        type: "object",
                        properties: {
                            RegEx: {
                                title: "RegEx",
                                type: "string"
                            },
                            RegExError: {
                                title: "RegExError",
                                type: "string"
                            }
                        }
                    }
                }
            }
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldType.TEXT_AREA, schema);
    }

    private registerSchemaForDate(): void {
        const schema = {
            $schema: "http://json-schema.org/draft-03/schema#",
            type: "object",
            properties: {
                ValueTTL: {
                    title: "TTL",
                    description: "Field value cleared after ValueTTL seconds after the field value is set.",
                    type: "string",
                    required: true
                },
                CountMin: {
                    title: "Count Min",
                    description: "The minimum number of items which are available for input if field is shown in edit mode.",
                    type: "integer",
                    required: true
                },
                CountMax: {
                    title: "Count Max",
                    description: "The maximum number of array or selectable items for this field. if field is shown in edit mode.",
                    type: "integer",
                    required: true
                },
                CountDefault: {
                    title: "Count Default",
                    description: "If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.",
                    type: "integer",
                    required: true
                },
                ItemSeparator: {
                    title: "Item Separator",
                    description: "If field contains multiple values, single values are concatenated by this separator symbol/s.",
                    type: "string",
                    required: false
                },
                DefaultValue: {
                    title: "Default Value",
                    description: "This value defines the offset (in days) to the very moment in which the field is initially displayed for input. Leave empty if the field should not hold any value upon first input. Keep in mind that date-fields are normalized to time \"00:00:00\", hence enter 1 in order to initialize the field with \"tomorrows\" date.",
                    type: "integer",
                    required: false
                },
                Link: {
                    title: "Link",
                    description: "An URL which may use placedholder referring to this fields value (or any other object property) as parameter, i.e. https://localhost/Field.Value.",
                    type: "string",
                    required: false
                },
                YearsInFuture: {
                    title: "Years in Future",
                    description: "",
                    type: "integer",
                    required: false
                },
                YearsInPast: {
                    title: "Years in Past",
                    description: "",
                    type: "integer",
                    required: false
                },
                DateRestriction: {
                    title: "Date Restriction",
                    type: "string",
                    default: "none",
                    enum: [
                        "none",
                        "DisableFutureDates",
                        "DisablePastDates"
                    ]
                },
            }
        };
        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldType.DATE, schema);
    }

    private registerSchemaForDateTime(): void {
        const schema = {
            $schema: "http://json-schema.org/draft-03/schema#",
            type: "object",
            properties: {
                ValueTTL: {
                    title: "TTL",
                    description: "Field value cleared after ValueTTL seconds after the field value is set.",
                    type: "string",
                    required: true
                },
                CountMin: {
                    title: "Count Min",
                    description: "The minimum number of items which are available for input if field is shown in edit mode.",
                    type: "integer",
                    required: true
                },
                CountMax: {
                    title: "Count Max",
                    description: "The maximum number of array or selectable items for this field. if field is shown in edit mode.",
                    type: "integer",
                    required: true
                },
                CountDefault: {
                    title: "Count Default",
                    description: "If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.",
                    type: "integer",
                    required: true
                },
                ItemSeparator: {
                    title: "Item Separator",
                    description: "If field contains multiple values, single values are concatenated by this separator symbol/s.",
                    type: "string",
                    required: false
                },
                DefaultValue: {
                    title: "Default Value",
                    description: "This value defines the offset (in seconds) to the very moment in which the field is initially displayed for input. Leave empty if the field should not hold any value upon first input. For instance, enter 3600 if the field should be initialized with \"now+1h\" or enter 86400 if the field should be initialized with \"now+24h\".",
                    type: "integer",
                    required: false
                },
                Link: {
                    title: "Link",
                    description: "An URL which may use placedholder referring to this fields value (or any other object property) as parameter, i.e. https://localhost/Field.Value.",
                    type: "string",
                    required: false
                },
                YearsInFuture: {
                    title: "Years in Future",
                    description: "",
                    type: "integer",
                    required: false
                },
                YearsInPast: {
                    title: "Years in Past",
                    description: "",
                    type: "integer",
                    required: false
                },
                DateRestriction: {
                    title: "Date Restriction",
                    type: "string",
                    default: "none",
                    enum: [
                        "none",
                        "DisableFutureDates",
                        "DisablePastDates"
                    ]
                },
            }
        };
        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldType.DATE_TIME, schema);
    }

    private registerSchemaForSelection(): void {
        const schema = {
            $schema: "http://json-schema.org/draft-03/schema#",
            type: "object",
            properties: {
                ValueTTL: {
                    title: "TTL",
                    description: "Field value cleared after ValueTTL seconds after the field value is set.",
                    type: "string",
                    required: true
                },
                CountMin: {
                    title: "Count Min",
                    description: "The minimum number of items which are available for input if field is shown in edit mode.",
                    type: "integer",
                    required: true
                },
                CountMax: {
                    title: "Count Max",
                    description: "The maximum number of array or selectable items for this field. if field is shown in edit mode.",
                    type: "integer",
                    required: true
                },
                CountDefault: {
                    title: "Count Default",
                    description: "If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.",
                    type: "integer",
                    required: true
                },
                ItemSeparator: {
                    title: "Item Separator",
                    description: "If field contains multiple values, single values are concatenated by this separator symbol/s.",
                    type: "string",
                    required: false
                },
                DefaultValue: {
                    title: "Default Value",
                    description: "The initial value of the field if shown in edit mode for the first time. Applies to first item of array only. Use the key of the possible value.",
                    type: "string",
                    required: false
                },
                Link: {
                    title: "Link",
                    description: "An URL which may use placedholder referring to this fields value (or any other object property) as parameter, i.e. https://localhost/Field.Value.",
                    type: "string",
                    required: false
                },
                PossibleNone: {
                    title: 'Possible None',
                    description: '',
                    type: "boolean",
                    format: "checkbox",
                    required: false
                },
                TranslatableValues: {
                    title: 'Translatable Values',
                    description: '',
                    type: "boolean",
                    format: "checkbox",
                    required: false
                },
                PossibleValues: {
                    title: "Possible Values",
                    description: "",
                    type: "array",
                    required: false,
                    items: {
                        type: "object",
                        properties: {
                            Key: {
                                title: "Key",
                                type: "string"
                            },
                            Value: {
                                title: "Value",
                                type: "string"
                            }
                        }
                    }
                }
            }
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldType.SELECTION, schema);
    }
}
