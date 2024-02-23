/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ServiceType } from './ServiceType';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { ContextService } from './ContextService';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { LabelService } from './LabelService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { AuthenticationSocketClient } from './AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DynamicFieldFormUtil } from './DynamicFieldFormUtil';
import { IdService } from '../../../../model/IdService';
import { ExtendedKIXObjectFormService } from './ExtendedKIXObjectFormService';
import { FormInstance } from './FormInstance';
import { KIXObjectService } from './KIXObjectService';
import { FormFactory } from './FormFactory';
import { FormService } from './FormService';

export abstract class KIXObjectFormService {

    protected extendedFormServices: ExtendedKIXObjectFormService[] = [];

    public addExtendedKIXObjectFormService(service: ExtendedKIXObjectFormService): void {
        this.extendedFormServices.push(service);
    }

    public abstract isServiceFor(kixObjectType: KIXObjectType | string): boolean;

    public isServiceType(kixObjectServiceType: ServiceType): boolean {
        return kixObjectServiceType === ServiceType.FORM;
    }

    public async initValues(
        form: FormConfiguration, formInstance: FormInstance, kixObject?: KIXObject
    ): Promise<void> {
        if (!kixObject) {
            const dialogContext = ContextService.getInstance().getActiveContext();
            if (dialogContext) {
                kixObject = await dialogContext.getObject(form.objectType);
            }
        }
        await this.prePrepareForm(form, kixObject, formInstance);
        for (const extendedService of this.extendedFormServices) {
            await extendedService.prePrepareForm(form, kixObject, formInstance);
        }

        FormFactory.initForm(form);

        const formFieldValues: Map<string, FormFieldValue<any>> = formInstance.getAllFormFieldValues();
        for (const p of form.pages) {
            for (const g of p.groups) {
                await this.prepareFormFieldValues(
                    g.formFields, kixObject, formFieldValues, form.formContext, formInstance
                );
            }
        }

        await this.postPrepareForm(form, formInstance, formFieldValues, kixObject);
        for (const extendedService of this.extendedFormServices) {
            await extendedService.postPrepareForm(form, formInstance, formFieldValues, kixObject);
        }

        (formInstance as any).formFieldValues = formFieldValues;
        for (const extendedService of this.extendedFormServices) {
            await extendedService.postInitValues(form, formInstance, kixObject);
        }
        const valueHandler = FormService.getInstance().getFormFieldValueHandler(form.objectType);
        if (valueHandler) {
            for (const handler of valueHandler) {
                await handler.postInitValues(formInstance);
            }
        }
    }

    protected async prePrepareForm(
        form: FormConfiguration, kixObject: KIXObject, formInstance: FormInstance
    ): Promise<void> {
        await DynamicFieldFormUtil.getInstance().configureDynamicFields(form);
    }

    protected async prepareFormFieldValues(
        formFields: FormFieldConfiguration[], kixObject: KIXObject, formFieldValues: Map<string, FormFieldValue<any>>,
        formContext: FormContext, formInstance: FormInstance
    ): Promise<void> {
        if (formContext === FormContext.NEW) {
            await this.handleCountValues(formFields, formInstance);
        } else if (formContext === FormContext.EDIT) {
            await DynamicFieldFormUtil.getInstance().handleDynamicFieldValues(
                formFields, kixObject, this, formFieldValues, formInstance.getObjectType()
            );
        }

        const values = [];
        for (const f of formFields) {
            if (formFieldValues.has(f.instanceId)) {
                continue;
            }

            let value = await this.getValue(
                f.property,
                kixObject ? kixObject[f.property] : (f.defaultValue ? f.defaultValue.value : null),
                kixObject,
                f,
                formContext
            );

            values.push([f.instanceId, value]);

            // TODO: move handling to this.getValue - object FormServices have to use super
            if (f.property === 'ICON') {
                if (kixObject && formContext === FormContext.EDIT) {
                    const icon = LabelService.getInstance().getObjectIcon(kixObject);
                    if (icon instanceof ObjectIcon) {
                        value = icon;
                    }
                } else if (!value) {
                    value = f.defaultValue.value;
                }
            }

            const formFieldValue = kixObject && formContext === FormContext.EDIT
                ? new FormFieldValue(value)
                : new FormFieldValue(value, f.defaultValue ? f.defaultValue.valid : undefined);

            if (!f.instanceId) {
                f.instanceId = IdService.generateDateBasedId(f.property);
            }

            formFieldValues.set(f.instanceId, formFieldValue);

            if (f.children) {
                await this.prepareFormFieldValues(f.children, kixObject, formFieldValues, formContext, formInstance);
            }
        }

        formInstance.provideFormFieldValues(values, null, true, false);
    }

    protected async getValue(
        property: string, value: any, object: KIXObject, formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        switch (property) {
            case KIXObjectProperty.DYNAMIC_FIELDS:
                value = formField.defaultValue ? formField.defaultValue.value : value;
                break;
            case 'ICON':
                if (object) {
                    const icon = LabelService.getInstance().getObjectIcon(object);
                    if (icon instanceof ObjectIcon) {
                        value = icon;
                    }
                }
                break;
            default:
        }
        return value;
    }

    protected async handleCountValues(formFields: FormFieldConfiguration[], formInstance: FormInstance): Promise<void> {
        const fields = [...formFields];
        for (const field of fields) {
            if (!field.asStructure) {
                if (field.countMin > 0) {
                    field.empty = false;

                    for (let i = 1; i < field.countMin; i++) {
                        const newField = await this.getNewFormField(formInstance, field);
                        const index = formFields.findIndex((f) => field.instanceId === f.instanceId);
                        formFields.splice(index, 0, newField);
                    }
                }

                const countDefault = field.countDefault;
                if (countDefault > 1 && countDefault > field.countMin && countDefault <= field.countMax) {
                    const c = field.countMin === 0 ? 1 : field.countMin;
                    for (let i = c; i < countDefault; i++) {
                        const newField = await this.getNewFormField(formInstance, field);
                        const index = formFields.findIndex((f) => field.instanceId === f.instanceId);
                        formFields.splice(index, 0, newField);
                    }
                }

                if (field.countMin === 0 && countDefault === 0) {
                    field.empty = true;
                }
            }
        }
    }

    protected async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, kixObject: KIXObject
    ): Promise<void> {
        return;
    }

    public async getNewFormField(
        formInstance: FormInstance, f: FormFieldConfiguration,
        parent?: FormFieldConfiguration, withChildren: boolean = true
    ): Promise<FormFieldConfiguration> {
        const newField = new FormFieldConfiguration(
            f.id,
            f.label, f.property, f.inputComponent, f.required, f.hint, f.options, f.defaultValue,
            [], null, (parent ? parent.instanceId : f.parentInstanceId), f.countDefault, f.countMax, f.countMin,
            f.maxLength, f.regEx, f.regExErrorMessage, f.empty, f.asStructure, f.readonly,
            f.placeholder, undefined, f.showLabel, f.name, f.draggableFields, f.defaultHint, f.type, f.visible,
            f.translateLabel, f.valid, f.countSeparatorString
        );

        newField.instanceId = IdService.generateDateBasedId(newField.property);

        const children: FormFieldConfiguration[] = [];
        if (withChildren && f.children) {
            for (const child of f.children) {
                const existingChildren = children.filter((c) => c.property === child.property);
                if (
                    !existingChildren.length
                    || typeof child.countDefault !== 'number'
                    || child.countDefault > existingChildren.length
                ) {
                    const newChild = await this.getNewFormField(formInstance, child, newField);
                    children.push(newChild);
                }
            }
        }
        newField.children = children;
        newField.parent = parent ? parent : f.parent;
        return newField;
    }

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
        return true;
    }

    public async hasReadPermissionFor(objectType: KIXObjectType | string): Promise<boolean> {
        const resource = this.getResource(objectType);
        return await AuthenticationSocketClient.getInstance().checkPermissions([
            new UIComponentPermission(resource, [CRUD.READ])
        ]);
    }

    protected getResource(objectType: KIXObjectType | string): string {
        return objectType.toLocaleLowerCase();
    }

    protected async checkPermissions(resource: string, crud: CRUD[] = [CRUD.READ]): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, crud)]
        );
    }

    public async updateFields(fields: FormFieldConfiguration[], formInstance: FormInstance): Promise<void> {
        return;
    }

    public async getFormParameter(
        forUpdate: boolean = false, createOptions?: KIXObjectSpecificCreateOptions, postPrepareValues: boolean = true
    ): Promise<Array<[string, any]>> {
        let parameter: Array<[string, any]> = [];

        const predefinedParameterValues = await this.preparePredefinedValues(forUpdate);
        if (predefinedParameterValues) {
            predefinedParameterValues.forEach((pv) => parameter.push([pv[0], pv[1]]));
        }

        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const formValues = formInstance?.getAllFormFieldValues();
        const iterator = formValues?.keys();
        let key = iterator?.next();
        while (key?.value) {
            const formFieldInstanceId = key.value;
            const field = await formInstance.getFormField(formFieldInstanceId);
            const property = field ? field.property : null;
            const value = formValues.get(formFieldInstanceId);

            if (value && typeof value.value !== 'undefined' && property) {
                if (property === KIXObjectProperty.DYNAMIC_FIELDS) {
                    parameter = await DynamicFieldFormUtil.getInstance().handleDynamicField(field, value, parameter);
                } else {
                    await this.prepareValue(forUpdate, property, field, value, formInstance, parameter);
                }
            }

            key = iterator.next();
        }

        const fixedValues = formInstance?.getFixedValues();
        const fixedIterator = fixedValues?.keys();
        let fixedKey = fixedIterator?.next();
        while (fixedKey?.value) {
            const property = fixedKey.value;
            const value = fixedValues.get(property) || [];
            const dfName = KIXObjectService.getDynamicFieldName(property);
            if (dfName) {
                await DynamicFieldFormUtil.getInstance().handleDynamicFieldByProperty(
                    property, value[1], parameter
                );
            } else {
                await this.prepareValue(forUpdate, property, null, value[1], formInstance, parameter);
            }

            fixedKey = fixedIterator.next();
        }

        const templateValues = formInstance?.getTemplateValues();
        const templateIterator = templateValues?.keys();
        let templateKey = templateIterator?.next();
        while (templateKey?.value) {
            const property = templateKey.value;
            const field = formInstance.getFormFieldByProperty(property);
            if (!field) {
                const value = templateValues.get(property) || [];
                const dfName = KIXObjectService.getDynamicFieldName(property);
                if (dfName) {
                    await DynamicFieldFormUtil.getInstance().handleDynamicFieldByProperty(
                        property, value[1], parameter
                    );
                } else {
                    await this.prepareValue(forUpdate, property, null, value[1], formInstance, parameter);
                }
            }

            templateKey = templateIterator.next();
        }

        if (formInstance && postPrepareValues) {
            parameter = await this.postPrepareValues(
                parameter, createOptions, formInstance?.getForm().formContext, formInstance
            );
        }

        return parameter;
    }

    private async prepareValue(
        forUpdate: boolean, property: string, field: FormFieldConfiguration, value: any, formInstance: FormInstance,
        parameter: Array<[string, any]>
    ): Promise<void> {
        let preparedValues: Array<[string, any]>;
        if (forUpdate) {
            preparedValues = await this.prepareUpdateValue(property, field, value.value, formInstance);
        } else {
            preparedValues = await this.prepareCreateValue(property, field, value.value, formInstance);
        }

        if (Array.isArray(preparedValues)) {
            preparedValues.forEach((pv) => {
                if (pv[0] === 'ICON' && !(pv[1] as ObjectIcon)?.Content) {
                    parameter.push([pv[0], null]);
                } else {
                    parameter.push([pv[0], pv[1]]);
                }
            });
        }
    }

    public async prepareUpdateValue(
        property: string, formField: FormFieldConfiguration, value: any, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {
        return await this.prepareCreateValue(property, formField, value, formInstance);
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {
        return [[property, value]];
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions: KIXObjectSpecificCreateOptions,
        formContext: FormContext, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {
        for (const extendedService of this.extendedFormServices) {
            parameter = await extendedService.postPrepareValues(parameter, createOptions, formContext, formInstance);
        }
        return parameter;
    }

    public async preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>> {
        return [];
    }

    public prepareCreateParameter(object: KIXObject): Array<[string, any]> {
        const parameter: Array<[string, any]> = [];
        for (const key in object) {
            if (object[key]) {
                parameter.push([key, object[key]]);
            }
        }
        return parameter;
    }

    protected getFormFieldOfForm(form: FormConfiguration, property: string): FormFieldConfiguration {
        let formField: FormFieldConfiguration;
        if (Array.isArray(form.pages)) {
            PAGES:
            for (const page of form.pages) {
                if (Array.isArray(page.groups)) {
                    for (const group of page.groups) {
                        if (Array.isArray(group.formFields)) {
                            formField = this.getFormField(group.formFields, property);
                            if (formField) {
                                break PAGES;
                            }
                        }
                    }
                }
            }
        }
        return formField;
    }

    private getFormField(fields: FormFieldConfiguration[], property): FormFieldConfiguration {
        let foundField: FormFieldConfiguration;
        if (Array.isArray(fields)) {
            for (const field of fields) {
                if (field.property === property) {
                    foundField = field;
                    break;
                } else if (Array.isArray(field.children)) {
                    foundField = this.getFormField(field.children, property);
                    if (foundField) {
                        break;
                    }
                }
            }
        }
        return foundField;
    }
}
