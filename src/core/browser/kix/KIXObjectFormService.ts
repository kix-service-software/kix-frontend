import {
    KIXObject, KIXObjectType, FormFieldValue, Form, FormField, ObjectIcon, FormContext, ContextType
} from "../../model";
import { IKIXObjectFormService } from "./IKIXObjectFormService";
import { ServiceType } from "./ServiceType";
import { LabelService } from "../LabelService";
import { ContextService } from "../context";
import { InlineContent } from "../components";

export abstract class KIXObjectFormService<T extends KIXObject = KIXObject> implements IKIXObjectFormService<T> {

    public abstract isServiceFor(kixObjectType: KIXObjectType): boolean;

    public isServiceType(kixObjectServiceType: ServiceType): boolean {
        return kixObjectServiceType === ServiceType.FORM;
    }

    public async initValues(form: Form): Promise<Map<string, FormFieldValue<any>>> {
        let kixObject: KIXObject;
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        if (context) {
            kixObject = await context.getObject();
        }

        const formFieldValues: Map<string, FormFieldValue<any>> = new Map();
        for (const g of form.groups) {
            await this.prepareFormFieldValues(g.formFields, kixObject, formFieldValues, form.formContext);
        }
        return formFieldValues;
    }

    public async initOptions(form: Form): Promise<void> {
        let kixObject: KIXObject;
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        if (context) {
            kixObject = await context.getObject();
        }

        for (const g of form.groups) {
            await this.prepareFormFieldOptions(g.formFields, kixObject, form.formContext);
        }
    }

    protected async prepareFormFieldValues(
        formFields: FormField[], kixObject: KIXObject, formFieldValues: Map<string, FormFieldValue<any>>,
        formContext: FormContext
    ): Promise<void> {
        for (const f of formFields) {
            let formFieldValue: FormFieldValue;
            if (kixObject || f.defaultValue) {
                let value = await this.getValue(
                    f.property,
                    kixObject && formContext === FormContext.EDIT ? kixObject[f.property] :
                        f.defaultValue ? f.defaultValue.value : null,
                    kixObject
                );

                if (f.property === 'ICON') {
                    if (kixObject && formContext === FormContext.EDIT) {
                        const icon = LabelService.getInstance().getIcon(kixObject);
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

    protected async prepareFormFieldOptions(formFields: FormField[], kixObject: KIXObject, formContext: FormContext) {
        return;
    }

    public getNewFormField(f: FormField, parent?: FormField): FormField {
        const newField = new FormField(
            f.label, f.property, f.inputComponent, f.required, f.hint, f.options, f.defaultValue,
            [], (parent ? parent.instanceId : f.parentInstanceId), f.countDefault, f.countMax, f.countMin,
            f.maxLength, f.regEx, f.regExErrorMessage, (f.countDefault === 0 ? true : false), f.asStructure, f.readonly,
            f.placeholder
        );
        const children: FormField[] = [];
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
        newField.children = children;
        newField.parent = parent ? parent : f.parent;
        return newField;
    }

    protected async getValue(property: string, value: any, object: KIXObject): Promise<any> {
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
}
