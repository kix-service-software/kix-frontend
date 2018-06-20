import { TicketInputTicketNumberComponentState } from "./TicketInputTicketNumberComponentState";
import { FormInputComponent } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputFulltextComponent extends FormInputComponent<string, TicketInputTicketNumberComponentState> {

    public onCreate(): void {
        this.state = new TicketInputTicketNumberComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<string>(this.state.field.property);
        this.state.currentValue = value.value;
    }

}

module.exports = TicketInputFulltextComponent;
