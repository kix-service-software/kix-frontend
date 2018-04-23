import { ArticleInputBodyComponentState } from "./ArticleInputBodyComponentState";
import { FormInputComponentState } from "@kix/core/dist/model";

class ArticleInputBodyComponent {

    private state: ArticleInputBodyComponentState;

    public onCreate(): void {
        this.state = new ArticleInputBodyComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

}

module.exports = ArticleInputBodyComponent;
