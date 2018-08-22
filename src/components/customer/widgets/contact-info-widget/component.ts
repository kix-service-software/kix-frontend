import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory } from "@kix/core/dist/browser";
import { KIXObjectType, Contact, Context } from "@kix/core/dist/model";

class Component {
    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

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

    private async initWidget(context: Context, contact?: Contact): Promise<void> {
        this.state.contact = contact ? contact : await context.getObject<Contact>();
        this.setActions();
    }
    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.contact]
            );
        }
    }

}

module.exports = Component;
