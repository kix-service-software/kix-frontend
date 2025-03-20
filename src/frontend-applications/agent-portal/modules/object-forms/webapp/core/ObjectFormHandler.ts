/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Error } from '../../../../../../server/model/Error';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { Context } from '../../../../model/Context';
import { IdService } from '../../../../model/IdService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';
import { ComponentContent } from '../../../base-components/webapp/core/ComponentContent';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { FormFactory } from '../../../base-components/webapp/core/FormFactory';
import { OverlayService } from '../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../base-components/webapp/core/OverlayType';
import { DynamicFormFieldOption } from '../../../dynamic-fields/webapp/core/DynamicFormFieldOption';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { FormConfigurationObject } from '../../model/FormConfigurationObject';
import { ObjectFormValue } from '../../model/FormValues/ObjectFormValue';
import { ObjectFormEvent } from '../../model/ObjectFormEvent';
import { ObjectFormValueMapper } from '../../model/ObjectFormValueMapper';
import { RuleResult } from '../../model/RuleResult';
import { ObjectFormRegistry } from './ObjectFormRegistry';
import { ObjectFormValidator } from './validation/ObjectFormValidator';

export class ObjectFormHandler<T extends KIXObject = any> {

    public constructor(public context: Context) { }

    public form: FormConfiguration;

    public objectFormValueMapper: ObjectFormValueMapper;
    public objectFormValidator: ObjectFormValidator;

    public configurationObject: FormConfigurationObject;

    public activePageId: string;

    public destroy(): void {
        this.objectFormValueMapper?.destroy();
        this.objectFormValidator?.destroy();
    }

    public async loadForm(createNewInstance?: boolean): Promise<void> {
        this.form = this.context.getFormManager().getForm();
        FormFactory.initForm(this.form);

        this.objectFormValueMapper?.destroy();
        this.objectFormValidator?.destroy();

        this.objectFormValueMapper = ObjectFormRegistry.getInstance().createObjectFormValueMapper(
            this.form?.objectType || this.context.descriptor.kixObjectTypes[0], this
        );
        if (this.objectFormValueMapper) {
            this.objectFormValueMapper.formContext = this.form?.formContext;
            this.objectFormValueMapper.setFormConfiguration(this.form);

            let formObject = this.context.getAdditionalInformation(AdditionalContextInformation.FORM_OBJECT);
            if (!formObject) {
                formObject = await this.context.getObject(
                    this.form?.objectType || this.context.descriptor.kixObjectTypes[0], createNewInstance
                );
            }

            this.activePageId = this.form?.pages[0]?.id;

            const start = Date.now();
            await this.objectFormValueMapper.mapFormValues(formObject).catch((e) => console.error(e));
            const end = Date.now();
            console.debug(`Map Form Values Finished: ${(end - start)}ms`);

            this.objectFormValidator = new ObjectFormValidator(this.objectFormValueMapper);
        }
    }

    public getFormValues(): ObjectFormValue[] {
        return this.objectFormValueMapper?.getFormValues();
    }

    public getObjectFormCreator(): ObjectFormValueMapper {
        return this.objectFormValueMapper;
    }

    public applyRuleResult(ruleResult: RuleResult): void {
        // TODO: field order not longer possible?
        // if (typeof ruleResult.InputOrder !== 'undefined') {
        //     this.objectFormValueMapper?.setFieldOrder(ruleResult.InputOrder);
        // }

        this.objectFormValueMapper?.applyWorkflowResult(ruleResult);
    }

    public async commit(): Promise<string | number> {

        await this.objectFormValidator?.enable();
        const valid = await this.objectFormValidator?.validateForm();
        if (!valid) {
            const validationResults = this.objectFormValueMapper.getValidationResults();
            console.debug('ValidationResults:');
            for (const vr of validationResults) {
                console.debug(vr.message);
            }

            const errorMessage = await TranslationService.translate('Translatable#Form contains invalid values');
            throw new Error('0', errorMessage);
        }

        let id: string | number;

        // do nothing
        const commitHandler = ObjectFormRegistry.getInstance().createObjectCommitHandler(this.objectFormValueMapper);
        if (commitHandler) {
            id = await commitHandler.commitObject()
                .catch(async (error: Error) => {
                    const title = await TranslationService.translate('Translatable#Error on create:');
                    const content = new ComponentContent('list-with-title',
                        {
                            title: title,
                            list: [`${error.Code}: ${error.Message}`]
                        }
                    );
                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                    );
                    throw error;
                });
        } else {
            console.error(`No object commit handler for type: ${this.objectFormValueMapper?.object?.KIXObjectType}`);
        }

        return id;
    }

    public async enableValidation(): Promise<void> {
        await this.objectFormValidator?.enable();
    }

    public disableValidation(): void {
        this.objectFormValidator?.disable();
    }

    public setActivePageId(pageId: string): void {
        this.activePageId = pageId;
        EventService.getInstance().publish(ObjectFormEvent.PAGE_CHANGED, pageId);
    }

    public addPage(): void {
        const page = new FormPageConfiguration(IdService.generateDateBasedId(), 'New Page');
        this.form.pages.push(page);
        EventService.getInstance().publish(ObjectFormEvent.PAGE_ADDED, page);

        setTimeout(() => this.setActivePageId(page.id), 150);
    }

    public removePage(): void {
        const index = this.form?.pages?.findIndex((p) => p.id === this.activePageId);
        if (index !== undefined && index !== -1) {
            this.form.pages.splice(index, 1);

            if (this.form.pages?.length) {
                let newPageIndex = 0;
                if (this.form.pages.length > 1) {
                    newPageIndex = index > 0 ? index - 1 : 0;
                }

                this.setActivePageId(this.form.pages[newPageIndex]?.id);
            }

            EventService.getInstance().publish(ObjectFormEvent.PAGE_DELETED);
        }
    }

    public addGroup(pageId: string = this.activePageId): void {
        const group = new FormGroupConfiguration(IdService.generateDateBasedId(), 'New Group');
        const page = this.form?.pages?.find((p) => p.id === pageId);
        page?.groups?.push(group);
        EventService.getInstance().publish(ObjectFormEvent.GROUP_ADDED, group);
    }

    public addNewField(field: FormFieldConfiguration, groupId: string): void {
        field.id = IdService.generateDateBasedId();
        const formGroup = this.getGroup(groupId) || this.getPageConfiguration(this.activePageId)?.groups[0];
        formGroup.formFields.push(field);
    }

    public updateField(field: FormFieldConfiguration, newGroupId: string): void {
        const formGroup = this.getGroupForField(field?.id);
        const fieldIndex = formGroup?.formFields?.findIndex((ff) => ff.id === field.id);
        if (formGroup && field && fieldIndex !== -1) {
            if (formGroup.id === newGroupId) {
                formGroup.formFields[fieldIndex] = field;
            } else {
                formGroup.formFields.splice(fieldIndex, 1);
                const newGroup = this.getGroup(newGroupId);
                newGroup.formFields.push(field);
            }
        }
    }

    public deleteField(fieldId: string): void {
        const formGroup = this.getGroupForField(fieldId);
        const fieldIndex = formGroup?.formFields?.findIndex((ff) => ff.id === fieldId);
        if (formGroup && fieldId && fieldIndex !== -1) {
            const removedFields = formGroup.formFields.splice(fieldIndex, 1);

            const dfOption = removedFields[0].options?.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
            const property = dfOption ? `${KIXObjectProperty.DYNAMIC_FIELDS}.${dfOption.value}` : removedFields[0]?.property;

            const formValue = this.objectFormValueMapper.findFormValue(property);
            if (formValue?.formValues?.length) {
                for (const fv of formValue.formValues) {
                    if (fv.fieldId) {
                        this.deleteField(fv.fieldId);
                    }
                }
            }

            formValue.fieldId = undefined;
            formValue.disable();

            this.removeFieldFromLayout(formGroup.id, removedFields[0].id);

            const configObject = new FormConfigurationObject();
            configObject.fieldId = fieldId;
            configObject.groupId = formGroup.id;
            EventService.getInstance().publish(ObjectFormEvent.FIELD_DELETED, configObject);
        }
    }

    public removeFieldFromLayout(groupId: string, fieldId: string): void {
        const groupLayout = this.form?.formLayout?.groupLayout?.find((gl) => gl.groupId === groupId);
        const index = groupLayout?.fieldLayout?.findIndex((fl) => fl.fieldId === fieldId);
        if (index !== undefined && index !== -1) {
            groupLayout.fieldLayout?.splice(index, 1);
        }

        if (groupLayout?.rowLayout?.length) {
            for (const row of groupLayout.rowLayout) {
                for (const column of row) {
                    const fieldIndex = column.formObjectIds?.findIndex((oid) => oid === fieldId);
                    if (fieldIndex !== undefined && fieldIndex !== -1) {
                        column.formObjectIds.splice(fieldIndex, 1);
                    }
                }
            }
        }
    }

    public deleteGroup(groupId: string): void {
        const page = this.getPageForGroup(groupId);
        const groupIndex = page?.groups?.findIndex((g) => g.id === groupId);
        if (groupIndex !== undefined && groupIndex !== -1) {
            page.groups.splice(groupIndex, 1);

            const layoutIndex = this.form.formLayout?.groupLayout?.findIndex((gl) => gl.groupId === groupId);
            if (layoutIndex !== undefined && layoutIndex !== -1) {
                this.form.formLayout?.groupLayout?.splice(layoutIndex, 1);
            }

            const configObject = new FormConfigurationObject();
            configObject.groupId = groupId;
            configObject.pageId = page.id;
            EventService.getInstance().publish(ObjectFormEvent.GROUP_DELETED, configObject);
        }
    }

    public async reInitField(fieldId: string): Promise<void> {
        const field = this.getFormField(fieldId);
        const formValue = await this.objectFormValueMapper.mapFormField(field, this.objectFormValueMapper.object);
        await formValue.initFormValue();

        const configObject = new FormConfigurationObject();
        configObject.fieldId = fieldId;

        const formGroup = this.getGroupForField(fieldId);
        configObject.groupId = formGroup.id;

        if (formValue.isControlledByParent) {
            formValue.parent?.initFormValue();
        }

        EventService.getInstance().publish(ObjectFormEvent.FIELD_REINITIALIZED, configObject);
    }

    public setConfigurationObject(configurationObject: any): void {
        this.configurationObject = configurationObject;
    }

    public getPageConfiguration(pageId: string): FormPageConfiguration {
        return this.form.pages?.find((p) => p.id === pageId);
    }

    public getGroup(id: string): FormGroupConfiguration {
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                if (g.id === id) {
                    return g;
                }
            }
        }
        return null;
    }

    public getPageForGroup(groupId: string): FormPageConfiguration {
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                if (g.id === groupId) {
                    return p;
                }
            }
        }
    }

    public getGroupForField(fieldId: string): FormGroupConfiguration {
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                const field = this.findSubFormField(fieldId, g.formFields);
                if (field) {
                    return g;
                }
            }
        }
    }

    public findSubFormField(fieldId: string, formFields: FormFieldConfiguration[] = []): FormFieldConfiguration {
        if (fieldId && Array.isArray(formFields)) {
            for (const field of formFields) {
                if (field.id === fieldId) {
                    return field;
                }

                if (field.children?.length) {
                    const subField = this.findFormField(fieldId, field.children);
                    if (subField) {
                        return field;
                    }
                }
            }
        }

        return null;
    }

    public getFormField(id: string): FormFieldConfiguration {
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                const field = this.findFormField(id, g.formFields);
                if (field) {
                    return field;
                }
            }
        }

        return null;
    }

    private findFormField(id: string, fields: FormFieldConfiguration[]): FormFieldConfiguration {
        let field = fields.find((f) => f.id === id);

        if (!field) {
            for (const f of fields) {
                const foundField = f.children && f.children.length ?
                    this.findFormField(id, f.children) : null;
                if (foundField) {
                    field = foundField;
                    break;
                }
            }
        }

        return field;
    }

    public findFormFieldByProperty(property: string): FormFieldConfiguration {
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                const fv = this.findFormFieldRecursiv(property, g.formFields || []);
                if (fv) {
                    return fv;
                }
            }
        }

        return null;
    }

    protected findFormFieldRecursiv(property: string, fields: FormFieldConfiguration[]): FormFieldConfiguration {
        for (const f of fields) {
            if (f.property === property) {
                return f;
            }

            if (f.children?.length) {
                const subField = this.findFormFieldRecursiv(property, f.children);
                if (subField) {
                    return subField;
                }
            }
        }
        return undefined;
    }


}