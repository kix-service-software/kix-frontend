import { ComponentState } from "./ComponentState";
import { FormInputComponent, KIXObjectType } from "@kix/core/dist/model";
import { IAutofillConfiguration } from "@kix/core/dist/browser/components";

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.setCurrentValue();

        const autofillOption = this.state.field.options.find((o) => o.option === 'Autofill');
        if (autofillOption) {
            const objectTypes = (autofillOption.value as string[]);
            const component = (this as any).getComponent(this.state.field.instanceId);
            if (component) {
                component.setAutocompleteConfiguration(objectTypes);
            }
        }
    }

    public setCurrentValue(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentValue = this.state.defaultValue.value;
            super.provideValue(this.state.currentValue);
        }
    }

    public valueChanged(value: string): void {
        this.state.currentValue = value;
        if (this.state.currentValue === '') {
            this.state.currentValue = null;
        }
        super.provideValue(this.state.currentValue);
    }

}

module.exports = Component;
