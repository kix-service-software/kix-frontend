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

    private setLabels(cell: ICell): void {
        let values = [];
        const value = cell.getValue();
        if (!Array.isArray(value.objectValue)) {
            values = [value.objectValue];
        } else {
            values = value.objectValue;
        }

        this.state.cellLabels = values.map((v) => new Label(null, v, null, v, null, v, false));
    }

}

module.exports = Component;
