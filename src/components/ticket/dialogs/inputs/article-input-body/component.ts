import { ArticleInputBodyComponentState } from "./ArticleInputBodyComponentState";

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
