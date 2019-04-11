import {
    AbstractMarkoComponent, ContextService, WidgetService, ActionFactory, IdService
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { TicketStateDetailsContext, TicketStateDetailsContextConfiguration } from '../../../../core/browser/ticket';
import { KIXObjectType, TicketState, WidgetType } from '../../../../core/model';
import { ComponentsService } from '../../../../core/browser/components';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configuration: TicketStateDetailsContextConfiguration;

    private ticketState: TicketState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketStateDetailsContext>(
            TicketStateDetailsContext.CONTEXT_ID
        );

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#State Information"
        ]);

        context.registerListener('ticket-state-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (
                objectId: string, ticketState: TicketState, objectType: KIXObjectType, changedProperties: string[]
            ) => {
                if (objectType === KIXObjectType.TICKET_STATE) {
                    this.initWidget(context, ticketState);
                }
            }
        });
        await this.initWidget(context);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async initWidget(context: TicketStateDetailsContext, ticketState?: TicketState): Promise<void> {
        this.state.error = null;
        this.state.loading = true;
        this.ticketState = ticketState ? ticketState : await context.getObject<TicketState>().catch((error) => null);

        if (!this.ticketState) {
            this.state.error = `Kein Ticketstatus mit ID ${context.getObjectId()} verfügbar.`;
        } else {
            await this.prepareTitle();
        }

        this.configuration = context.getConfiguration();
        this.state.lanes = context.getLanes();
        this.state.tabWidgets = context.getLaneTabs();
        this.state.contentWidgets = context.getContent(true);

        this.prepareActions();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    public async prepareTitle(): Promise<void> {
        this.state.title = this.ticketState.Name;
    }

    private async prepareActions(): Promise<void> {
        const config = this.configuration;
        if (config && this.ticketState) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                config.actions, this.ticketState
            );

            const generalActions = await ActionFactory.getInstance().generateActions(
                config.generalActions, this.ticketState
            );

            WidgetService.getInstance().registerActions(this.state.instanceId, generalActions);
        }
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
