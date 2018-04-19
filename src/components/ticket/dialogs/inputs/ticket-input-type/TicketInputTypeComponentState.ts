import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputTypeComponentState extends FormInputComponentState {

    public constructor(public items: FormDropdownItem[] = []) {
        super();
    }

}
