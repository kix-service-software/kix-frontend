import { ComponentState } from './ComponentState';
import { KIXObjectSearchService, ContextService, OverlayService } from '../../core/browser';
import { KIXObjectType, Ticket, OverlayType, StringContent } from '../../core/model';
import { EventService } from '../../core/browser/event';
import { ApplicationEvent } from '../../core/browser/application';
import { SearchContext } from '../../core/browser/search/context';
import { TranslationService } from '../../core/browser/i18n/TranslationService';

export class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.placeholder = await TranslationService.translate("Translatable#Quick search (Tickets)");
    }

    public async search(textValue: string): Promise<void> {
        if (textValue && textValue !== '') {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Search Tickets ...' }
            );

            await KIXObjectSearchService.getInstance().executeFullTextSearch<Ticket>(
                KIXObjectType.TICKET, textValue
            ).catch((error) => {
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, new StringContent(error), 'Translatable#Ticket search error!', true
                );
            });

            ContextService.getInstance().setContext(SearchContext.CONTEXT_ID, null, null, null, null, true);

            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: false, hint: '' }
            );
        }
    }

}

module.exports = Component;
