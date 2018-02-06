import { TicketData, TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";
import { DynamicField } from "@kix/core/dist/model/ticket/DynamicField";
import { DynamicFieldContainerComponentState } from './DynamicFieldContainerComponentState';

class DynamicFieldsContainerComponent {

    private state: DynamicFieldContainerComponentState;

    public onCreate(): void {
        this.state = new DynamicFieldContainerComponentState();
    }

    public onInput(input: any): void {
        this.state.ticketDynamicFields = input.dynamicFields;
        this.state.ticketId = Number(input.ticketId);
    }

    public onMount(input: any): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        this.setDisplayGroups();
    }

    private contextNotified(id: string, type: ContextNotification, ...args) {
        if (id === TicketService.TICKET_DATA_ID && type === ContextNotification.OBJECT_UPDATED) {
            this.setDisplayGroups();
        }
    }

    private setDisplayGroups(): void {
        const ticketData = ContextService.getInstance().getObject<TicketData>(TicketService.TICKET_DATA_ID);
        if (ticketData) {
            this.state.dynamicFields = ticketData.dynamicFields;
            this.state.displayGroups = ticketData.dynamicFieldGroups
                .filter((dfg) => this.getDFsOfGroup(dfg.ItemID).length);
        }
    }

    private getDFsOfGroup(groupId: number): DynamicField[] {
        const dFsOfGroup = this.state.ticketDynamicFields.filter((tdf) => {
            const field = this.state.dynamicFields.find((df) => tdf.ID === df.ID);
            return field && field.DisplayGroupID === groupId;
        });
        return dFsOfGroup;
    }
}

module.exports = DynamicFieldsContainerComponent;
