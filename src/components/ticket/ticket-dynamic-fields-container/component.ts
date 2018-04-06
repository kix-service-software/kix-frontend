import { ContextService } from '@kix/core/dist/browser/context/';
import { DynamicField } from '@kix/core/dist/model/kix/ticket/DynamicField';

import { DynamicFieldContainerComponentState } from './DynamicFieldContainerComponentState';
import { WidgetType } from '@kix/core/dist/model';

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
        ContextService.getInstance().getContext().setWidgetType('dynamic-fields-group-widget', WidgetType.GROUP);
    }

    private setDisplayGroups(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.dynamicFields = objectData.dynamicFields;
            this.state.displayGroups = objectData.dynamicFieldGroups
                .filter((dfg) => this.getDynamicFields(dfg.ItemID).length);
        }
    }

    private getDynamicFields(groupId: number): DynamicField[] {
        const dynamicFields = this.state.ticketDynamicFields.filter((tdf) => {
            const field = this.state.dynamicFields.find((df) => tdf.ID === df.ID);
            return field && field.DisplayGroupID === groupId;
        });
        return dynamicFields;
    }
}

module.exports = DynamicFieldsContainerComponent;
