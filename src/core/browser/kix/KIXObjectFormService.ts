import { KIXObject, KIXObjectType, FormFieldValue, Form, FormField, ObjectIcon } from "../../model";
import { IKIXObjectFormService } from "./IKIXObjectFormService";
import { ServiceType } from "./ServiceType";
import { LabelService } from "../LabelService";

export abstract class KIXObjectFormService<T extends KIXObject = KIXObject> implements IKIXObjectFormService<T> {

    protected formFieldValues: Map<string, FormFieldValue<any>> = new Map();

    public abstract isServiceFor(kixObjectType: KIXObjectType): boolean;

    public isServiceType(kixObjectServiceType: ServiceType): boolean {
        return kixObjectServiceType === ServiceType.FORM;
    }

    public async initValues(form: Form, kixObject?: T): Promise<Map<string, FormFieldValue<any>>> {
        this.formFieldValues.clear();
        for (const g of form.groups) {
            await this.prepareFormFieldValues(g.formFields, kixObject);
        }
        return this.formFieldValues;
    }

    public async prepareFormFieldValues(formFields: FormField[], kixObject?: T): Promise<void> {
        for (const f of formFields) {
            let formFieldValue: FormFieldValue;
            if (kixObject || f.defaultValue) {
                let value = await this.getValue(
                    f.property,
                    kixObject ? kixObject[f.property] : f.defaultValue.value,
                    kixObject
                );

                if (f.property === 'ICON') {
                    if (kixObject) {
                        const icon = LabelService.getInstance().getIcon(kixObject);
                        if (icon instanceof ObjectIcon) {
                            value = icon;
                        }
                    } else {
                        value = f.defaultValue.value;
                    }
                }

                formFieldValue = kixObject
                    ? new FormFieldValue(value)
                    : new FormFieldValue(value, f.defaultValue.valid);
            } else {
                formFieldValue = new FormFieldValue(null);
            }
            this.formFieldValues.set(f.instanceId, formFieldValue);

            if (f.children) {
                this.prepareFormFieldValues(f.children, kixObject);
            }
        }
    }

    public getNewFormField(f: FormField, parent?: FormField): FormField {
        const newField = new FormField(
            f.label, f.property, f.inputComponent, f.required, f.hint, f.options, f.defaultValue,
            [], (parent ? parent.instanceId : f.parentInstanceId), f.countDefault, f.countMax, f.countMin,
            f.maxLength, f.regEx, f.regExErrorMessage, (f.countDefault === 0 ? true : false), f.asStructure, f.readonly
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

    protected async getValue(property: string, value: any, object: T): Promise<any> {
        return value;
    }
}
