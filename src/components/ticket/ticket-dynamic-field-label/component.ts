import { DateTimeUtil, DynamicField, KIXObjectType } from "../../../core/model/";
import { ContextService } from "../../../core/browser/context/";
import { DynamicFieldLabelComponentState } from './DynamicFieldLabelComponentState';
import { KIXObjectService } from "../../../core/browser";

export class TicketPriorityLabelComponent {

    private state: DynamicFieldLabelComponentState;

    public onCreate(input: any): void {
        this.state = new DynamicFieldLabelComponentState();
    }

    public onInput(input: any): void {
        this.state.fieldId = Number(input.value);
        this.state.ticket = input.ticket;
    }

    public onMount(): void {
        this.setDisplayValue();
    }

    private async setDisplayValue(): Promise<void> {
        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, [this.state.fieldId]
        );
        if (dynamicFields && dynamicFields.length) {
            this.state.field = dynamicFields[0];
            if (this.state.field && this.state.ticket) {
                const field = this.state.ticket.DynamicFields.find((df) => df.ID === this.state.fieldId);
                if (field) {
                    this.state.value = field.Value;
                    this.state.displayValue = field.DisplayValue;

                    if (this.state.field.FieldType === "Date") {
                        this.state.displayValue = await DateTimeUtil.getLocalDateString(field.DisplayValue);
                    } else if (this.state.field.FieldType === "DateTime") {
                        this.state.displayValue = await DateTimeUtil.getLocalDateTimeString(field.DisplayValue);
                    }
                }
            }
        }
    }
}

module.exports = TicketPriorityLabelComponent;
