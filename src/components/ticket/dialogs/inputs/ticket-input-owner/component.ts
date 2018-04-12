import { TicketInputOwnerComponentState } from "./TicketInputOwnerComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropDownItem } from "@kix/core/dist/model";

class TicketInputOwnerComponent {

    private state: TicketInputOwnerComponentState;

    public onCreate(): void {
        this.state = new TicketInputOwnerComponentState();
    }

    public onInput(input): void {
        this.state.field = input.field;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.agents.map((a) => new FormDropDownItem(a.UserID, 'kix-icon-man', a.UserFullname));
    }

}

module.exports = TicketInputOwnerComponent;
