import { LabelComponentState } from './LabelComponentState';
import { Label } from '@kix/core/dist/browser/components';

class LabelListComponent {

    private state: LabelComponentState;

    public onCreate(): void {
        this.state = new LabelComponentState();
    }

    public onInput(input: any): void {
        this.state.labels = input.labels;
    }

    public removeLabel(label: Label): void {
        (this as any).emit('removeLabel', label);
    }
}

module.exports = LabelListComponent;
