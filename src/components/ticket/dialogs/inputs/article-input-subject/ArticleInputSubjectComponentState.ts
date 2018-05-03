import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class ArticleInputSubjectComponentState extends FormInputComponentState {

    public constructor(public items: FormDropdownItem[] = []) {
        super();
    }

}
