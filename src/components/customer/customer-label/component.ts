import { ComponentState } from "./ComponentState";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.labelProvider = input.labelProvider;
        this.state.property = input.property;
        this.state.object = input.object;
    }

    public async onMount(): Promise<void> {
        this.state.propertyText = await this.state.labelProvider.getPropertyText(this.state.property);
        this.state.displayText = await this.state.labelProvider.getDisplayText(this.state.object, this.state.property);
        this.state.title = `${this.state.propertyText}: ${this.state.displayText}`;
    }

}

module.exports = Component;
