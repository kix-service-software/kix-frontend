import { ComponentState } from './ComponentState';
import { ObjectPropertyLabelInput } from './ObjectPropertyLabelInput';
import { ObjectIcon } from '@kix/core/dist/model';

export class ObjectPropertyLabelComponent<T> {

    private state: ComponentState<T>;

    private hasIcon: boolean = false;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ObjectPropertyLabelInput<T>): void {
        this.state.object = input.object;
        this.state.property = input.property;
        this.state.labelProvider = input.labelProvider;
        this.hasIcon = typeof input.showIcon !== 'undefined' ? input.showIcon : false;
    }

    public onMount(): void {
        this.prepareDisplayText();
        this.preparePropertyName();
    }

    private async prepareDisplayText(): Promise<void> {
        this.state.propertyDisplayText = await this.getPropertyDisplayText();
        this.state.propertyIcon = await this.getIcon();
    }

    private async preparePropertyName(): Promise<void> {
        let name = this.state.property;
        if (this.state.labelProvider) {
            name = await this.state.labelProvider.getPropertyText(this.state.property);
        }
        this.state.propertyName = name;
    }

    private async getIcon(): Promise<string | ObjectIcon> {
        const icons = await this.state.labelProvider.getIcons(this.state.object, this.state.property);
        let icon = null;
        if (icons && icons.length) {
            icon = icons[0];
        }
        return icon;
    }

    private async getPropertyDisplayText(): Promise<string> {
        let value = this.state.property;
        if (this.state.labelProvider && this.state.object) {
            value = await this.state.labelProvider.getDisplayText(this.state.object, this.state.property);
        }
        return value;
    }

    public getValueClasses(): string {
        let classes = [];
        if (this.state.labelProvider) {
            classes = this.state.labelProvider.getDisplayTextClasses(this.state.object, this.state.property);
        }
        return classes.join(',');
    }

}

module.exports = ObjectPropertyLabelComponent;
