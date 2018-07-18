import { ComponentState } from "./ComponentState";
import { FormInputComponent } from "@kix/core/dist/model";

class ArticleInputBodyComponent extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
    }

    public valueChanged(value: string): void {
        super.provideValue(value);
    }

}

module.exports = ArticleInputBodyComponent;
