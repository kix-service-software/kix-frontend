import { ComponentState } from './ComponentState';
import { TicketService } from '../../../core/browser/ticket';
import { Article } from '../../../core/model';

class Component {

    private state: ComponentState;

    private article: Article = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.article = input.article;
    }

    public onMount(): void {
        this.prepareContent();
    }

    public async prepareContent(): Promise<void> {
        if (this.article) {
            const prepareContent = await TicketService.getInstance().getPreparedArticleBodyContent(this.article);
            this.state.inlineContent = prepareContent[1];
            this.state.content = prepareContent[0];
        }
    }
}

module.exports = Component;
