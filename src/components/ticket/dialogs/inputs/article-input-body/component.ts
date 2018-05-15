import { ArticleInputBodyComponentState } from "./ArticleInputBodyComponentState";
import { FormInputComponentState, FormInputComponent } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser";

class ArticleInputBodyComponent extends FormInputComponent<string, ArticleInputBodyComponentState> {

    public onCreate(): void {
        this.state = new ArticleInputBodyComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
    }

    public setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<string>(this.state.field.property);
            if (value) {
                this.state.currentValue = value.value;
            }
        }
    }

    private valueChanged(value: string): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        super.provideValue(value);
    }

}

module.exports = ArticleInputBodyComponent;
