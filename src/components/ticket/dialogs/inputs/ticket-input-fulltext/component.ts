import { TicketInputFulltextComponentState } from "./TicketInputFulltextComponentState";
import { FormInputComponent } from "@kix/core/dist/model";

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

}

module.exports = TicketInputFulltextComponent;
