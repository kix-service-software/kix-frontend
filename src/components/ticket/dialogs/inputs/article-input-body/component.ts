import { ArticleInputBodyComponentState } from "./ArticleInputBodyComponentState";
import { FormInputComponentState } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser";

class ArticleInputBodyComponent {

    private state: ArticleInputBodyComponentState;

    public onCreate(): void {
        this.state = new ArticleInputBodyComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.registerListener(this.formUpdated.bind(this));
    }

    public formUpdated(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<string>(this.state.field.property);
            if (value) {
                this.state.invalid = !value.valid;
            }
        }
    }

    private valueChanged(value: string): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue<string>(this.state.field.property, value);
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.invalid = !fieldValue.valid;
    }

}

module.exports = ArticleInputBodyComponent;
