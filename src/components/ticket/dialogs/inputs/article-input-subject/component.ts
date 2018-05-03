import { ArticleInputSubjectComponentState } from "./ArticleInputSubjectComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, TreeNode, FormFieldValue
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class ArticleInputSubjectComponent {

    private state: ArticleInputSubjectComponentState;

    public onCreate(): void {
        this.state = new ArticleInputSubjectComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    private valueChanged(value: string): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue(this.state.field, new FormFieldValue<string>(value));
    }

}

module.exports = ArticleInputSubjectComponent;
