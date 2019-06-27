import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, Label, ICell } from '../../../../../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell = input.cell;
        if (cell) {
            this.setLabels(cell);
        }
    }

    private async setLabels(cell: ICell): Promise<void> {
        let values = [];
        const value = cell.getValue();
        if (Array.isArray(value.objectValue)) {
            if (typeof value.objectValue[0] === 'object') {
                const stringValue = await cell.getDisplayValue();
                values = stringValue.split(',').map((v) => v.trim());
            } else {
                values = value.objectValue;
            }
        } else {
            values = [value.objectValue];
        }

        this.state.cellLabels = values.map((v) => new Label(null, v, null, v, null, v, false));
    }

}

module.exports = Component;
