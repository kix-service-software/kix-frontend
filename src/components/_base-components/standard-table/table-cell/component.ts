import { TableRow, LabelService, TableColumn, TableValue } from "@kix/core/dist/browser";
import { KIXObject } from "@kix/core/dist/model";
import { ComponentState } from './ComponentState';
import { RoutingConfiguration } from "@kix/core/dist/browser/router";

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
            const labelProvider = LabelService.getInstance().getLabelProviderForType(this.row.object.KIXObjectType);
            this.state.icons = await labelProvider.getIcons(this.row.object, this.column.id);
            const displayText = await labelProvider.getDisplayText(this.row.object, this.column.id);
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
