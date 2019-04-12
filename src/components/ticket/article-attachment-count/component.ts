import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ContextService, OverlayService } from '../../../core/browser';
import { TicketDetailsContext } from '../../../core/browser/ticket';
import { Ticket, ComponentContent, ToastContent, OverlayType } from '../../../core/model';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );

        if (context) {
            const ticket = await context.getObject<Ticket>();
            if (ticket) {
                let count = 0;
                ticket.Articles.forEach((article) => {
                    if (article.Attachments) {
                        const attachments = article.Attachments.filter((a) => a.Disposition !== 'inline');
                        if (attachments.length > 0) {
                            count += attachments.length;
                        }
                    }
                });

                this.state.attachmentCount = count;

            }
        }
    }

    public async attachmentsClicked(): Promise<void> {
        const text = await TranslationService.translate('Translatable#We are working on this functionality.');
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-magicwand', text, 'Coming Soon')
        );
        OverlayService.getInstance().openOverlay(OverlayType.HINT_TOAST, null, content, '');
    }


}

module.exports = Component;
