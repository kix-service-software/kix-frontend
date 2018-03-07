import { Ticket } from "@kix/core/dist/model";
import { ObjectPropertyLabelComponentState } from './ObjectPropertyLabelComponentState';
import { ObjectPropertyLabelInput } from './ObjectPropertyLabelInput';

export class ObjectPropertyLabelComponent<T> {

    private state: ObjectPropertyLabelComponentState<T>;

    public onCreate(): void {
        this.state = new ObjectPropertyLabelComponentState();
    }

    public onInput(input: ObjectPropertyLabelInput<T>): void {
        this.state.object = input.object;
        this.state.property = input.property;
        this.state.labelProvider = input.labelProvider;
    }

    private getPropertyName(): string {
        let name = this.state.property;
        if (this.state.labelProvider) {
            name = this.state.labelProvider.getPropertyText(this.state.property);
        }
        return name;
    }

    private getPropertyDisplayText(): string {
        let value = this.state.property;
        if (this.state.labelProvider && this.state.object) {
            value = this.state.labelProvider.getDisplayText(this.state.object, this.state.property);
        }
        return value;
    }

    private getValueClasses(): string {
        let classes = [];
        if (this.state.labelProvider) {
            classes = this.state.labelProvider.getDisplayTextClasses(this.state.object, this.state.property);
        }
        return classes.join(',');
    }

}

module.exports = ObjectPropertyLabelComponent;
