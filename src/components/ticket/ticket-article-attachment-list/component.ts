import { AttachementListComponentState } from './AttchementListComponentState';

class TicketArticleAttchementListComponent {

    private state: AttachementListComponentState;

    public onCreate(): void {
        this.state = new AttachementListComponentState();
    }

    public onInput(input: any): void {
        this.state.article = input.article;
    }

}

module.exports = TicketArticleAttchementListComponent;
