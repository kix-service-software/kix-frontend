import { TicketInputArchiveSearchComponentState } from "./TicketInputArchiveSearchCompontentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState } from "@kix/core/dist/model";

class TicketInputArchiveSearch {

    private state: TicketInputArchiveSearchComponentState;

    public onCreate(): void {
        this.state = new TicketInputArchiveSearchComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        this.state.items = [
            new FormDropdownItem('all', '', 'Alle Tickets'),
            new FormDropdownItem('archived', '', 'Archivierte Tickets'),
            new FormDropdownItem('notArchived', '', 'Nicht archivierte Tickets')
        ];
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
    }
}

module.exports = TicketInputArchiveSearch;
