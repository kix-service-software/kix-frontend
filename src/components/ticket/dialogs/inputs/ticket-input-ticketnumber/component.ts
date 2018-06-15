import { TicketInputTicketNumberComponentState } from "./TicketInputTicketNumberComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, TreeNode, FormFieldValue, FormInputComponent
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputFulltextComponent extends FormInputComponent<string, TicketInputTicketNumberComponentState> {

    public onCreate(): void {
        this.state = new TicketInputTicketNumberComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<string>(this.state.field.property);
        this.state.currentValue = value.value;
    }

}

module.exports = TicketInputFulltextComponent;
