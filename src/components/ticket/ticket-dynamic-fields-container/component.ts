import { TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
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
        this.setDisplayGroups();
    }

    private setDisplayGroups(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.dynamicFields = objectData.dynamicFields;
            this.state.displayGroups = objectData.dynamicFieldGroups
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
ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
