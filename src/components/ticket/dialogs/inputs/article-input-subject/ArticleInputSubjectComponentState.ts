import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class ArticleInputSubjectComponentState extends FormInputComponentState<string> {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentValue: string = null
    ) {
        super();
    }

}
