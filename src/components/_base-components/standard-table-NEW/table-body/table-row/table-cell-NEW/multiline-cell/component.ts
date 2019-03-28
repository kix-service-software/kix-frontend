import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.cell = input.cell;
        this.update();
    }

    private async update(): Promise<void> {
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
