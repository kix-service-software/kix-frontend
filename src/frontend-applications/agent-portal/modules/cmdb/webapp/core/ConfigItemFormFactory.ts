/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { ConfigItemClassProperty } from '../../model/ConfigItemClassProperty';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ConfigItemClass } from '../../model/ConfigItemClass';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AttributeDefinition } from '../../model/AttributeDefinition';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { GeneralCatalogItemProperty } from '../../../general-catalog/model/GeneralCatalogItemProperty';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { IdService } from '../../../../model/IdService';
import { ExtendedConfigItemFormFactory } from './ExtendedConfigItemFormFactory';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { FormService } from '../../../base-components/webapp/core/FormService';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { ContextMode } from '../../../../model/ContextMode';
import { VersionProperty } from '../../model/VersionProperty';
import { Context } from '../../../../model/Context';

export class ConfigItemFormFactory {

    private static INSTANCE: ConfigItemFormFactory;

    public static getInstance(): ConfigItemFormFactory {
        if (!ConfigItemFormFactory.INSTANCE) {
            ConfigItemFormFactory.INSTANCE = new ConfigItemFormFactory();
        }
        return ConfigItemFormFactory.INSTANCE;
    }

    private constructor() { }

    private extendedConfigItemFormFactories: ExtendedConfigItemFormFactory[] = [];

    public addExtendedConfigItemFormFactory(factory: ExtendedConfigItemFormFactory): void {
        this.extendedConfigItemFormFactories.push(factory);
    }

    public async createAndProvideForm(classId: number, context?: Context): Promise<void> {
        if (!context) {
            context = ContextService.getInstance().getActiveContext();
        }
        const formContext = context?.descriptor?.contextMode === ContextMode.CREATE
            ? FormContext.NEW
            : FormContext.EDIT;

        const form = this.createForm(classId, formContext);

        await this.addCIClassAttributesToForm(form, classId);

        await FormService.getInstance().addForm(form);
        await context?.getFormManager()?.setFormId(form?.id);

        const formInstance = await context.getFormManager().getFormInstance();
        formInstance?.provideFixedValue(ConfigItemProperty.CLASS_ID, new FormFieldValue(classId));
    }

    private createForm(classId: number, formContext: FormContext): FormConfiguration {
        const nameField = new FormFieldConfiguration(
            'cmdb-config-item-new-form-field-name',
            'Translatable#Name', VersionProperty.NAME, null, true,
            'Translatable#Helptext_CMDB_ConfigItemCreateEdit_Name',
            null, null, null, null, null, 1, 1, 1,
            null, null, null, false, false
        );

        const deplStateField = ConfigItemFormFactory.createDeploymentStateField();
        const inciStateField = ConfigItemFormFactory.createIncidentStateField();

        const group = new FormGroupConfiguration(
            'cmdb-config-item-new-form-group-main', 'Translatable#Config Item Data', [], null,
            [nameField, deplStateField, inciStateField]
        );

        const page = new FormPageConfiguration(
            'cmdb-config-item-new-form-page', 'Translatable#New Config Item', [], true, false, [group]
        );

        const formId = `new-asset-form-${classId}`;
        return new FormConfiguration(
            formId, 'Translatable#New Config Item', [], KIXObjectType.CONFIG_ITEM, true, formContext, null, [page]
        );
    }

    public static createDeploymentStateField(): FormFieldConfiguration {
        return new FormFieldConfiguration(
            'cmdb-config-item-new-form-field-deploymentstate',
            'Translatable#Deployment State', VersionProperty.DEPL_STATE_ID, 'object-reference-input',
            true, 'Translatable#Helptext_CMDB_ConfigItemCreateEdit_DeploymentState',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.GENERAL_CATALOG_ITEM),
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                            FilterType.AND, 1
                        ),
                        new FilterCriteria(
                            GeneralCatalogItemProperty.CLASS, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, 'ITSM::ConfigItem::DeploymentState'
                        )
                    ])
                ),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false)
            ],
            null, null, null, null, 1, 1, 1, null, null, null, false, false
        );
    }

    public static createIncidentStateField(): FormFieldConfiguration {
        return new FormFieldConfiguration(
            'cmdb-config-item-new-form-field-incidentstate',
            'Translatable#Incident state', ConfigItemProperty.CUR_INCI_STATE_ID, 'object-reference-input',
            true, 'Translatable#Helptext_CMDB_ConfigItemCreateEdit_IncidentState',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.GENERAL_CATALOG_ITEM),
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                            FilterType.AND, 1
                        ),
                        new FilterCriteria(
                            GeneralCatalogItemProperty.CLASS, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, 'ITSM::Core::IncidentState'
                        )
                    ])
                ),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false)
            ],
            null, null, null, null, 1, 1, 1, null, null, null, false, false
        );
    }

    public async addCIClassAttributesToForm(form: FormConfiguration, classId: number): Promise<void> {
        if (form.pages[0] && form.pages[0].groups[0] && classId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, [ConfigItemClassProperty.CURRENT_DEFINITION]
            );
            const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
                KIXObjectType.CONFIG_ITEM_CLASS, [classId], loadingOptions
            );

            if (ciClasses && ciClasses.length) {
                const ciClass = ciClasses[0];
                if (ciClass.CurrentDefinition && ciClass.CurrentDefinition.Definition) {
                    for (const ad of ciClass.CurrentDefinition.Definition) {
                        const field = this.getFormField(ad);
                        form.pages[0].groups[0].formFields.push(field);
                    }
                }
            }
        }
    }

    private getFormField(
        ad: AttributeDefinition, parentInstanceId?: string, parent?: FormFieldConfiguration
    ): FormFieldConfiguration {
        let formField: FormFieldConfiguration;
        if (typeof ad.CountDefault === 'undefined' || ad.CountDefault === null) {
            ad.CountDefault = 1;
        }

        for (const extendedFactory of this.extendedConfigItemFormFactories) {
            formField = extendedFactory.getFormField(ad, parentInstanceId, parent);
            if (formField) {
                break;
            }
        }

        if (!formField) {
            if (ad.Input.Type === 'GeneralCatalog') {
                formField = this.getGeneralCatalogField(ad, parentInstanceId);
            } else if (ad.Input.Type === 'Text') {
                formField = this.getTextField(ad, parentInstanceId);
            } else if (ad.Input.Type === 'TextArea') {
                formField = this.getTextAreaField(ad, parentInstanceId);
            } else if (ad.Input.Type === 'Contact') {
                formField = this.getObjectReferenceField(ad, parentInstanceId, KIXObjectType.CONTACT);
            } else if (ad.Input.Type === 'Organisation') {
                formField = this.getObjectReferenceField(ad, parentInstanceId, KIXObjectType.ORGANISATION);
            } else if (ad.Input.Type === 'CIClassReference') {
                formField = this.getCIClassReferenceField(ad, parentInstanceId);
            } else if (ad.Input.Type === 'Date') {
                formField = this.getDateField(ad, parentInstanceId);
            } else if (ad.Input.Type === 'DateTime') {
                formField = this.getDateTimeField(ad, parentInstanceId);
            } else if (ad.Input.Type === 'Attachment') {
                formField = this.getAttachmentFormField(ad, parentInstanceId);
            } else if (ad.Input.Type === 'Dummy') {
                formField = this.getDefaultFormField(ad, parentInstanceId, true);
                formField.empty = true;
                formField.asStructure = true;
            } else {
                formField = this.getDefaultFormField(ad, parentInstanceId);
            }
        }

        if (formField.countDefault === 0 || (parent && !parent.asStructure && parent.empty)) {
            formField.empty = true;
        }

        formField.instanceId = IdService.generateDateBasedId();

        if (ad.Sub) {
            formField.children = ad.Sub.map((subField) => this.getFormField(subField, formField.instanceId, formField));
        }

        return formField;
    }

    private getGeneralCatalogField(ad: AttributeDefinition, parentInstanceId?: string): FormFieldConfiguration {
        return new FormFieldConfiguration(ad.Key, ad.Name, ad.Key, 'object-reference-input', ad.Input.Required, null,
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.GENERAL_CATALOG_ITEM),
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                            FilterType.AND, 1
                        ),
                        new FilterCriteria(
                            GeneralCatalogItemProperty.CLASS, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, ad.Input['Class']
                        )
                    ])
                ),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.OBJECT_REFERENCE)
            ],
            null, null, null, parentInstanceId, ad.CountDefault, ad.CountMax,
            ad.CountMin, ad.Input.MaxLength,
            ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getTextField(ad: AttributeDefinition, parentInstanceId: string): FormFieldConfiguration {
        return new FormFieldConfiguration(ad.Key, ad.Name, ad.Key, null, ad.Input.Required, null,
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.TEXT)
            ], null, null, null, parentInstanceId, ad.CountDefault, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getTextAreaField(ad: AttributeDefinition, parentInstanceId: string): FormFieldConfiguration {
        return new FormFieldConfiguration(ad.Key, ad.Name, ad.Key, 'text-area-input', ad.Input.Required, null,
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.TEXT_AREA)
            ], null, null, null, parentInstanceId, ad.CountDefault, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getObjectReferenceField(
        ad: AttributeDefinition, parentInstanceId: string, objectType: KIXObjectType
    ): FormFieldConfiguration {
        return new FormFieldConfiguration(ad.Key, ad.Name, ad.Key, 'object-reference-input', ad.Input.Required, null,
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, objectType),
                new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                new FormFieldOption(ObjectReferenceOptions.UNIQUE, false),
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.OBJECT_REFERENCE)
            ], null, null, null, parentInstanceId, ad.CountDefault, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getCIClassReferenceField(ad: AttributeDefinition, parentInstanceId: string): FormFieldConfiguration {
        let classes = [];
        if (Array.isArray(ad.Input['ReferencedCIClassName'])) {
            classes = ad.Input['ReferencedCIClassName'];
        } else {
            classes = [ad.Input['ReferencedCIClassName']];
        }
        return new FormFieldConfiguration(ad.Key, ad.Name, ad.Key, 'object-reference-input', ad.Input.Required, null,
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.CONFIG_ITEM),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true),
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.OBJECT_REFERENCE),
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            ConfigItemProperty.CLASS, SearchOperator.IN,
                            FilterDataType.STRING, FilterType.AND, classes
                        ),
                        new FilterCriteria(
                            ConfigItemProperty.NUMBER, SearchOperator.LIKE,
                            FilterDataType.STRING, FilterType.OR, SearchProperty.SEARCH_VALUE
                        ),
                        new FilterCriteria(
                            ConfigItemProperty.NAME, SearchOperator.LIKE,
                            FilterDataType.STRING, FilterType.OR, SearchProperty.SEARCH_VALUE
                        )
                    ])
                )
            ],
            null, null, null, parentInstanceId, ad.CountDefault, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getDateField(ad: AttributeDefinition, parentInstanceId: string): FormFieldConfiguration {
        return new FormFieldConfiguration(ad.Key, ad.Name, ad.Key, 'date-time-input', ad.Input.Required, null,
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.DATE),
            ],
            null, null, null, parentInstanceId, ad.CountDefault, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength,
            ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getDateTimeField(ad: AttributeDefinition, parentInstanceId: string): FormFieldConfiguration {
        return new FormFieldConfiguration(ad.Key, ad.Name, ad.Key, 'date-time-input', ad.Input.Required, null,
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.DATE_TIME)
            ], null, null, null, parentInstanceId, ad.CountDefault, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getDefaultFormField(
        ad: AttributeDefinition, parentInstanceId: string, dummy: boolean = false
    ): FormFieldConfiguration {
        return new FormFieldConfiguration(ad.Key, ad.Name, ad.Key, null, ad.Input.Required, null,
            [
                new FormFieldOption(
                    FormFieldOptions.INPUT_FIELD_TYPE, dummy ? InputFieldTypes.DUMMY : InputFieldTypes.TEXT
                )
            ], null, null, null, parentInstanceId, ad.CountDefault, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getAttachmentFormField(ad: AttributeDefinition, parentInstanceId: string): FormFieldConfiguration {
        return new FormFieldConfiguration(ad.Key, ad.Name, ad.Key, 'attachment-input', ad.Input.Required, null,
            [
                new FormFieldOption('MULTI_FILES', false),
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.ATTACHMENT)
            ], null, null, null, parentInstanceId, ad.CountDefault, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }
}
