import { ComponentState } from './ComponentState';
import { Attachment } from '../../../core/model';

class TicketArticleAttchementListComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.article && input.article.Attachments) {
            this.state.article = input.article;
            const attachments: Attachment[] = input.article.Attachments;
            this.state.attachments = attachments.filter((a) => a.Disposition !== 'inline');
        }
    }

}

module.exports = TicketArticleAttchementListComponent;
