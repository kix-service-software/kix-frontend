import { FormFieldValue, FormFieldOption } from "../../components";

export class PersonalSetting {

    public constructor(
        public group: string,
        public property: string,
        public label: string,
        public hint: string,
        public inputType?: string,
        public defaultValue: FormFieldValue = null,
        public options?: FormFieldOption[]
    ) { }
}
