import { ComponentState } from "./ComponentState";
import { KIXObjectType, WidgetType, Contact, ContextType } from "@kix/core/dist/model";
import {
    ContextService, ActionFactory, IdService, WidgetService, KIXObjectServiceRegistry
} from "@kix/core/dist/browser";
import { ContactDetailsContext } from "@kix/core/dist/browser/contact";
import { ComponentsService } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }
    public async onMount(): Promise<void> {
        const context = (ContextService.getInstance().getActiveContext() as ContactDetailsContext);
        context.registerListener('contact-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (contactId: string, contact: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT) {
                    this.initWidget(context, contact);
                }
            }
        });
        await this.initWidget(context);
    }

    private async initWidget(context: ContactDetailsContext, contact?: Contact): Promise<void> {
        this.state.contact = contact ? contact : await context.getObject<Contact>();
        this.state.configuration = context.getConfiguration();
        this.state.lanes = context.getLanes();
        this.state.tabWidgets = context.getLaneTabs();
        this.setActions();
    }

    private setActions(): void {
        const config = this.state.configuration;
        if (config && this.state.contact) {
            const actions = ActionFactory.getInstance().generateActions(
                config.generalActions, true, [this.state.contact]
            );
            WidgetService.getInstance().registerActions(this.state.instanceId, actions);

            this.state.contactActions = ActionFactory.getInstance().generateActions(
                config.contactActions, true, [this.state.contact]
            );
        }
    }

    public getTitle(): string {
        const context = ContextService.getInstance().getActiveContext();
        return context.getDisplayText();

    }

    public getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
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
