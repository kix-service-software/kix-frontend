import { KIXObject, FormFieldValue, Form, FormField } from "../../model";
import { IKIXService } from "./IKIXService";

export interface IKIXObjectFormService<T extends KIXObject = KIXObject> extends IKIXService {

    initValues(form: Form, object?: KIXObject): Promise<Map<string, FormFieldValue<any>>>;

    getNewFormField(formField: FormField): FormField;

}
