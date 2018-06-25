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
    }

    public valueChanged(value: string): void {
        super.provideValue(value);
    }

}

module.exports = ArticleInputBodyComponent;
