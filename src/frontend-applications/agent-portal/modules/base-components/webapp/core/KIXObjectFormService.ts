/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFormService } from "./IKIXObjectFormService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ServiceType } from "./ServiceType";
import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { ContextService } from "./ContextService";
import { ContextType } from "../../../../model/ContextType";
import { FormContext } from "../../../../model/configuration/FormContext";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { LabelService } from "./LabelService";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";
import { InlineContent } from "./InlineContent";
import { AuthenticationSocketClient } from "./AuthenticationSocketClient";
import { UIComponentPermission } from "../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../server/model/rest/CRUD";
import { KIXObjectSpecificCreateOptions } from "../../../../model/KIXObjectSpecificCreateOptions";
import { FormService } from "./FormService";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { DynamicFieldFormUtil } from "./DynamicFieldFormUtil";
import { IdService } from "../../../../model/IdService";
import { IFormInstance } from "./IFormInstance";

export abstract class KIXObjectFormService implements IKIXObjectFormService {

    public abstract isServiceFor(kixObjectType: KIXObjectType | string): boolean;

    public isServiceType(kixObjectServiceType: ServiceType): boolean {
        return kixObjectServiceType === ServiceType.FORM;
    }

    public async initValues(form: FormConfiguration, kixObject?: KIXObject): Promise<Map<string, FormFieldValue<any>>> {
        if (!kixObject) {
            const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
            if (dialogContext) {
                kixObject = await dialogContext.getObject(form.objectType);
            }
        }
        await this.prePrepareForm(form, kixObject);

        const formFieldValues: Map<string, FormFieldValue<any>> = new Map();
        for (const p of form.pages) {
            for (const g of p.groups) {
                await this.prepareFormFieldValues(g.formFields, kixObject, formFieldValues, form.formContext);
            }
        }

        await this.postPrepareForm(form, formFieldValues, kixObject);
        return formFieldValues;
    }

    protected async prePrepareForm(form: FormConfiguration, kixObject?: KIXObject): Promise<void> {
        await DynamicFieldFormUtil.configureDynamicFields(form);
    }

    protected async prepareFormFieldValues(
        formFields: FormFieldConfiguration[], kixObject: KIXObject, formFieldValues: Map<string, FormFieldValue<any>>,
        formContext: FormContext
    ): Promise<void> {
        if (formContext === FormContext.NEW) {
            this.handleCountValues(formFields);
        } else if (formContext === FormContext.EDIT) {
            await DynamicFieldFormUtil.handleDynamicFieldValues(formFields, kixObject, this);
        }

        for (const f of formFields) {
            let formFieldValue: FormFieldValue;
            let value = await this.getValue(
                f.property,
                kixObject ? kixObject[f.property] : (f.defaultValue ? f.defaultValue.value : null),
                kixObject,
                f,
                formContext
            );

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

            formFieldValue = kixObject && formContext === FormContext.EDIT
                ? new FormFieldValue(value)
                : new FormFieldValue(value, f.defaultValue ? f.defaultValue.valid : undefined);

            if (!f.instanceId) {
                f.instanceId = IdService.generateDateBasedId(f.property);
            }

            formFieldValues.set(f.instanceId, formFieldValue);

            if (f.children) {
                this.prepareFormFieldValues(f.children, kixObject, formFieldValues, formContext);
            }
        }
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

    protected handleCountValues(formFields: FormFieldConfiguration[]): void {
        const fields = [...formFields];
        for (const field of fields) {
            if (!field.asStructure) {
                if (field.countMin > 0) {
                    field.empty = false;

                    for (let i = 1; i < field.countMin; i++) {
                        const newField = this.getNewFormField(field);
                        const index = formFields.findIndex((f) => field.instanceId === f.instanceId);
                        formFields.splice(index, 0, newField);
                    }
                }

                const countDefault = field.countDefault;
                if (countDefault > 1 && countDefault > field.countMin && countDefault <= field.countMax) {
                    const c = field.countMin === 0 ? 1 : field.countMin;
                    for (let i = c; i < countDefault; i++) {
                        const newField = this.getNewFormField(field);
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
        form: FormConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, kixObject: KIXObject
    ): Promise<void> {
        return;
    }

    public async initOptions(form: FormConfiguration): Promise<void> {
        let kixObject: KIXObject;
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        if (context && form.formContext && form.formContext === FormContext.EDIT) {
            kixObject = await context.getObject();
        }

        for (const p of form.pages) {
            for (const g of p.groups) {
                await this.prepareFormFieldOptions(g.formFields, kixObject, form.formContext);
            }
        }
    }

    protected async prepareFormFieldOptions(
        formFields: FormFieldConfiguration[], kixObject: KIXObject, formContext: FormContext
    ) {
        return;
    }

    public getNewFormField(
        f: FormFieldConfiguration, parent?: FormFieldConfiguration, withChildren: boolean = true
    ): FormFieldConfiguration {
        const newField = new FormFieldConfiguration(
            f.id,
            f.label, f.property, f.inputComponent, f.required, f.hint, f.options, f.defaultValue,
            [], null, (parent ? parent.instanceId : f.parentInstanceId), f.countDefault, f.countMax, f.countMin,
            f.maxLength, f.regEx, f.regExErrorMessage, f.empty, f.asStructure, f.readonly,
            f.placeholder, undefined, f.showLabel, f.name, f.draggableFields, f.defaultHint
        );

        newField.instanceId = IdService.generateDateBasedId(newField.property);

        const children: FormFieldConfiguration[] = [];
        if (withChildren && f.children) {
            for (const child of f.children) {
                const existingChildren = children.filter((c) => c.property === child.property);
                if (
                    !!!existingChildren.length
                    || typeof child.countDefault !== 'number'
                    || child.countDefault > existingChildren.length
                ) {
                    children.push(this.getNewFormField(child, newField));
                }
            }
        }
        newField.children = children;
        newField.parent = parent ? parent : f.parent;
        return newField;
    }

    protected replaceInlineContent(value: string, inlineContent: InlineContent[]): string {
        let newString = value;
        for (const contentItem of inlineContent) {
            if (contentItem.contentId) {
                const replaceString = `data:${contentItem.contentType};base64,${contentItem.content}`;
                const contentIdLength = contentItem.contentId.length - 1;
                const contentId = contentItem.contentId.substring(1, contentIdLength);
                const regexpString = new RegExp('cid:' + contentId, "g");
                newString = newString.replace(regexpString, replaceString);
            }
        }
        return newString;
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

    public async updateForm(
        formInstance: IFormInstance, form: FormConfiguration, formField: FormFieldConfiguration, value: any
    ): Promise<void> {
        return;
    }

    public async updateFields(fields: FormFieldConfiguration[], formInstance: IFormInstance): Promise<void> {
        return;
    }

    public async prepareFormFields(
        formId: string, forUpdate: boolean = false, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<Array<[string, any]>> {
        let parameter: Array<[string, any]> = [];

        const predefinedParameterValues = await this.preparePredefinedValues(forUpdate);
        if (predefinedParameterValues) {
            predefinedParameterValues.forEach((pv) => parameter.push([pv[0], pv[1]]));
        }

        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const formValues = formInstance.getAllFormFieldValues();
        const iterator = formValues.keys();
        let key = iterator.next();
        while (key.value) {
            const formFieldInstanceId = key.value;
            const field = await formInstance.getFormField(formFieldInstanceId);
            const property = field ? field.property : null;
            const value = formValues.get(formFieldInstanceId);

            if (value && typeof value.value !== 'undefined' && property) {
                if (property === KIXObjectProperty.DYNAMIC_FIELDS) {
                    parameter = await DynamicFieldFormUtil.handleDynamicField(field, value, parameter);
                } else {
                    let preparedValue;
                    if (forUpdate) {
                        preparedValue = await this.prepareUpdateValue(property, value.value, formInstance);
                    } else {
                        preparedValue = await this.prepareCreateValue(property, value.value, formInstance);
                        if (property === 'ICON' && preparedValue[1] && !(preparedValue[1] as ObjectIcon).Content) {
                            preparedValue[1] = null;
                        }
                    }
                    if (preparedValue) {
                        preparedValue.forEach((pv) => parameter.push([pv[0], pv[1]]));
                    }
                }
            }

            key = iterator.next();
        }
        parameter = await this.postPrepareValues(parameter, createOptions, formInstance.getForm().formContext);

        return parameter;
    }

    public async prepareUpdateValue(
        property: string, value: any, formInstance: IFormInstance
    ): Promise<Array<[string, any]>> {
        return await this.prepareCreateValue(property, value, formInstance);
    }

    public async prepareCreateValue(
        property: string, value: any, formInstance: IFormInstance
    ): Promise<Array<[string, any]>> {
        return [[property, value]];
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext
    ): Promise<Array<[string, any]>> {
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
