import { ArticleInputBodyComponentState } from "./ArticleInputBodyComponentState";
import { FormInputComponent } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser";

class ArticleInputBodyComponent extends FormInputComponent<string, ArticleInputBodyComponentState> {

    public onCreate(): void {
        this.state = new ArticleInputBodyComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        this.setCurrentValue();
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

    public valueChanged(value: string): void {
        super.provideValue(value);
    }

}

module.exports = ArticleInputBodyComponent;
