/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObject, KIXObjectType, FormFieldValue,
    ObjectIcon, FormContext, ContextType, CRUD
} from "../../model";
import { IKIXObjectFormService } from "./IKIXObjectFormService";
import { ServiceType } from "./ServiceType";
import { LabelService } from "../LabelService";
import { ContextService } from "../context";
import { InlineContent } from "../components";
import { AuthenticationSocketClient } from "../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { FormConfiguration, FormFieldConfiguration } from "../../model/components/form/configuration";

export abstract class KIXObjectFormService<T extends KIXObject = KIXObject> implements IKIXObjectFormService<T> {

    public abstract isServiceFor(kixObjectType: KIXObjectType): boolean;

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
        await this.prePrepareForm(form);

        const formFieldValues: Map<string, FormFieldValue<any>> = new Map();
        for (const p of form.pages) {
            for (const g of p.groups) {
                await this.prepareFormFieldValues(g.formFields, kixObject, formFieldValues, form.formContext);
            }
        }

        await this.postPrepareForm(form, formFieldValues, kixObject);
        return formFieldValues;
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

    protected async prepareFormFieldValues(
        formFields: FormFieldConfiguration[], kixObject: KIXObject, formFieldValues: Map<string, FormFieldValue<any>>,
        formContext: FormContext
    ): Promise<void> {
        for (const f of formFields) {
            let formFieldValue: FormFieldValue;
            if (kixObject || f.defaultValue) {
                let value = await this.getValue(
                    f.property,
                    kixObject && formContext === FormContext.EDIT ? kixObject[f.property] :
                        f.defaultValue ? f.defaultValue.value : null,
                    kixObject,
                    f
                );

                if (f.property === 'ICON') {
                    if (kixObject && formContext === FormContext.EDIT) {
                        const icon = LabelService.getInstance().getObjectIcon(kixObject);
                        if (icon instanceof ObjectIcon) {
                            value = icon;
                        }
                    } else {
                        value = f.defaultValue.value;
                    }
                }

                formFieldValue = kixObject && formContext === FormContext.EDIT
                    ? new FormFieldValue(value)
                    : new FormFieldValue(value, f.defaultValue ? f.defaultValue.valid : undefined);
            } else {
                formFieldValue = new FormFieldValue(null);
            }
            formFieldValues.set(f.instanceId, formFieldValue);

            if (f.children) {
                this.prepareFormFieldValues(f.children, kixObject, formFieldValues, formContext);
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
            f.maxLength, f.regEx, f.regExErrorMessage, f.countDefault === 0, f.asStructure, f.readonly,
            f.placeholder
        );
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

    protected async getValue(
        property: string, value: any, object: KIXObject, formField: FormFieldConfiguration
    ): Promise<any> {
        return value;
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

    protected async prePrepareForm(form: FormConfiguration): Promise<void> {
        return;
    }

    protected async postPrepareForm(
        form: FormConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, kixObject: KIXObject
    ): Promise<void> {
        return;
    }

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
        return true;
    }

    public async hasReadPermissionFor(objectType: KIXObjectType): Promise<boolean> {
        const resource = this.getResource(objectType);
        return await AuthenticationSocketClient.getInstance().checkPermissions([
            new UIComponentPermission(resource, [CRUD.READ])
        ]);
    }

    protected getResource(objectType: KIXObjectType): string {
        return objectType.toLocaleLowerCase();
    }

    protected async checkPermissions(resource: string, crud: CRUD[] = [CRUD.READ]): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, crud)]
        );
    }

    public async updateFields(fields: FormFieldConfiguration[]): Promise<void> {
        return;
    }
}
