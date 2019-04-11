import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../core/browser/context';
import {
    WidgetType, Ticket, KIXObjectType, DynamicField, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType
} from '../../../../core/model/';
import { ActionFactory, WidgetService, KIXObjectService, SearchOperator } from '../../../../core/browser';
import { TicketDetailsContext } from '../../../../core/browser/ticket';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Description", "Translatable#Comment"
        ]);

        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        WidgetService.getInstance().setWidgetType('ticket-description-widget', WidgetType.GROUP);
        WidgetService.getInstance().setWidgetType('ticket-description-notes', WidgetType.GROUP);

        context.registerListener('ticket-description-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (ticketId: string, ticket: Ticket, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET) {
                    this.initWidget(ticket);
                }
            }
        });

        await this.initWidget(await context.getObject<Ticket>());
    }

    private async initWidget(ticket: Ticket): Promise<void> {
        this.state.loading = true;
        this.state.ticket = ticket;
        await this.getFirstArticle();
        this.prepareActions();
        await this.getTicketNotes();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    private async getFirstArticle(): Promise<void> {
        if (this.state.ticket) {
            this.state.firstArticle = this.state.ticket.getFirstArticle();
        }
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.firstArticle) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.firstArticle]
            );
        }
    }

    private async getTicketNotes(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(['DynamicField.ID'], [
            new FilterCriteria('Name', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'TicketNotes')
        ]);

        const danymicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
        );

        if (danymicFields && danymicFields.length) {
            if (this.state.ticket) {
                const ticketNotesDF = this.state.ticket.DynamicFields.find(
                    (df) => df.ID === danymicFields[0].ID
                );
                if (ticketNotesDF) {
                    this.state.ticketNotes = ticketNotesDF.DisplayValue;
                }
            }
        }
    }
}

module.exports = Component;
