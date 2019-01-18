import { ComponentState } from './ComponentState';
import { KIXObjectSearchService, ContextService, OverlayService } from '../../core/browser';
import { KIXObjectType, Ticket, OverlayType, StringContent } from '../../core/model';
import { SearchContext } from '../../core/browser/search';
import { EventService } from '../../core/browser/event';

export class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async search(textValue: string): Promise<void> {
        if (textValue && textValue !== '') {
            EventService.getInstance().publish('APP_LOADING', { loading: true, hint: 'Suche Tickets ...' });

            await KIXObjectSearchService.getInstance().executeFullTextSearch<Ticket>(
                KIXObjectType.TICKET, textValue
            ).catch((error) => {
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, new StringContent(error), 'Fehler bei der Ticketsuche!', true
                );
            });

            ContextService.getInstance().setContext(SearchContext.CONTEXT_ID, null, null, null, null, true);

            EventService.getInstance().publish('APP_LOADING', { loading: false, hint: 'Suche Tickets ...' });
        }
    }

}

module.exports = Component;
