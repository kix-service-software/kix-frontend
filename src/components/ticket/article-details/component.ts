import { ArticleDetailsComponentState } from './ArticleDetailsComponentState';

export class ArticleDetailsComponent {

    private state: ArticleDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new ArticleDetailsComponentState();
    }

    public onInput(input: any): void {
        this.state.article = input.article;
    }

    public onMount(): void {
        // nothing
    }
}

module.exports = ArticleDetailsComponent;
