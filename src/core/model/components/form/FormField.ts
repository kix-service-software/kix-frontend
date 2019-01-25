import { FormFieldOption } from ".";
import { FormFieldValue } from "./events";
import { IdService } from "../../../browser";

export class FormField<T = any> {

    public instanceId: string;

    public parent: FormField;

    public constructor(
        public label: string,
        public property: string,
        public inputComponent: string,
        public required: boolean = false,
        public hint?: string,
        public options: FormFieldOption[] = [],
        public defaultValue: FormFieldValue<T> = new FormFieldValue(null),
        public children: FormField[] = [],
        public parentInstanceId: string = null,
        public countDefault: number = null,
        public countMax: number = null,
        public countMin: number = null,
        public maxLength: number = null,
        public regEx: string = null,
        public regExErrorMessage: string = null,
        public empty: boolean = false,
        public asStructure: boolean = false,
        public readonly: boolean = false,
        public placeholder: string = null
    ) {
        this.instanceId = IdService.generateDateBasedId(this.property);
    }
}
