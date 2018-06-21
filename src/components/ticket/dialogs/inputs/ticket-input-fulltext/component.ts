import { TicketInputFulltextComponentState } from "./TicketInputFulltextComponentState";
import { FormInputComponent } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputFulltextComponent extends FormInputComponent<string, TicketInputFulltextComponentState> {

    public onCreate(): void {
        this.state = new TicketInputFulltextComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
    }


    public setCurrentValue(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<string>(this.state.field.property);
            if (value) {
                this.state.currentValue = value.value;
            }
        }
        this.setCurrentValue();
    }

}

module.exports = TicketInputFulltextComponent;
