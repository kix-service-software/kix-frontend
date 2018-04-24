import { ArticleInputAttachmentComponentState } from "./ArticleInputAttachmentComponentState";
import { FormInputComponentState } from "@kix/core/dist/model";

class ArticleInputAttachmentComponent {

    private state: ArticleInputAttachmentComponentState;

    public onCreate(): void {
        this.state = new ArticleInputAttachmentComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

}

module.exports = ArticleInputAttachmentComponent;
