import { LabelComponentState } from './LabelComponentState';
import { Label } from '@kix/core/dist/browser/components';
import { SortUtil } from '@kix/core/dist/model';

class LabelListComponent {

    private state: LabelComponentState;

    public onCreate(): void {
        this.state = new LabelComponentState();
    }

    public onInput(input: LabelComponentState): void {
        if (input.labels) {
            this.state.labels = input.labels.sort(
                (a, b) => SortUtil.compareString(a.object.KIXObjectType, b.object.KIXObjectType)
            );
        }
    }

    public removeLabel(label: Label): void {
        (this as any).emit('removeLabel', label);
    }
}

module.exports = LabelListComponent;
