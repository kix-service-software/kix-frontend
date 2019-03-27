import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ICell, OverlayService } from '../../../../core/browser';
import { Article, OverlayType, ComponentContent } from '../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    private article: Article;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell: ICell = input.cell;
        if (cell) {
            this.article = cell.getRow().getRowObject().getObject();
            if (this.article && this.article instanceof Article) {
                const attachments = this.article.Attachments.filter((a) => a.Disposition !== 'inline');
                this.state.show = attachments.length > 0;
                this.state.count = attachments.length;
            }
        }
    }

    public async onMount(): Promise<void> {
        return;
    }

    public attachmentClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        if (this.article) {
            const data = { article: this.article };

            OverlayService.getInstance().openOverlay(
                OverlayType.INFO,
                'article-attachment-widget',
                new ComponentContent('ticket-article-attachment-list', data, this.article),
                'Anlagen',
                false,
                [
                    event.target.getBoundingClientRect().left,
                    event.target.getBoundingClientRect().top
                ]
            );
        }

    }

}

module.exports = Component;
