import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        this.state.cell = input.cell;
        if (this.state.cell) {
            const value = await this.state.cell.getDisplayValue();
            this.state.text = value;
        }
    }

    public async onMount(): Promise<void> {
        return;
    }

}

module.exports = Component;
