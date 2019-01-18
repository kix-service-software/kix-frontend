import { TableRow, LabelService, TableColumn } from "../../../../core/browser";
import { KIXObject } from "../../../../core/model";
import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;

    public column: TableColumn;
    public row: TableRow;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        this.column = input.column;
        this.row = input.row;
    }

    public async onMount(): Promise<void> {
        if (this.row && this.column) {
            this.state.icons
                = await LabelService.getInstance().getPropertyValueDisplayIcons(this.row.object, this.column.id);
            const displayText
                = await LabelService.getInstance().getPropertyValueDisplayText(this.row.object, this.column.id);
            if (displayText) {
                this.state.displayValue = displayText;
            } else {
                const value = this.row.values.find((v) => v.columnId === this.column.id);
                this.state.displayValue = value ? value.displayValue : null;
            }
        }
        this.state.loading = false;
    }

    public rowClicked(row: TableRow<KIXObject>, columnId: string): void {
        (this as any).emit('rowClicked', row, columnId);
    }

}

module.exports = Component;
