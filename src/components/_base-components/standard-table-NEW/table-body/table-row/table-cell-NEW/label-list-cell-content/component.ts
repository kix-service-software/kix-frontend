import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, Label, ICell } from '../../../../../../../core/browser';
import { TranslationLanguage } from '../../../../../../../core/model';

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

        this.state.cellLabels = (values as TranslationLanguage[]).map(
            (v) => new Label(null, v.Value, null, v.Language, null, v.Language, false)
        );
    }

}

module.exports = Component;
