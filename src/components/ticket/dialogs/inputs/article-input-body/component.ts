import { ArticleInputBodyComponentState } from "./ArticleInputBodyComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropDownItem, ObjectIcon, TicketProperty } from "@kix/core/dist/model";

class ArticleInputBodyComponent {

    private state: ArticleInputBodyComponentState;

    public onCreate(): void {
        this.state = new ArticleInputBodyComponentState();
    }

    public onInput(input): void {
        this.state.field = input.field;
    }

}

module.exports = ArticleInputBodyComponent;
