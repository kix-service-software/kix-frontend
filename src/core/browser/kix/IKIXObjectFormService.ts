import { KIXObject, FormFieldValue, Form, FormField } from "../../model";
import { IKIXService } from "./IKIXService";

export interface IKIXObjectFormService<T extends KIXObject = KIXObject> extends IKIXService {

    initValues(form: Form): Promise<Map<string, FormFieldValue<any>>>;

    initOptions(form: Form): Promise<void>;

    getNewFormField(formField: FormField): FormField;

}
