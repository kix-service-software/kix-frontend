import { ComponentState } from "./ComponentState";
import { KIXObjectType, WidgetType, Customer } from "../../../core/model";
import {
    ContextService, ActionFactory, IdService, WidgetService
} from "../../../core/browser";
import { CustomerDetailsContext } from "../../../core/browser/customer";
import { ComponentsService } from "../../../core/browser/components";
import { TranslationService } from "../../../core/browser/i18n/TranslationService";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Customer Information"
        ]);

        const context = (ContextService.getInstance().getActiveContext() as CustomerDetailsContext);
        context.registerListener('customer-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (customerId: string, customer: Customer, type: KIXObjectType) => {
                if (type === KIXObjectType.CUSTOMER) {
                    this.initWidget(context, customer);
                }
            }
        });
        await this.initWidget(context);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async initWidget(context: CustomerDetailsContext, customer?: Customer): Promise<void> {
        this.state.error = null;
        this.state.loading = true;
        this.state.customer = customer ? customer : await context.getObject<Customer>().catch((error) => null);

        if (!this.state.customer) {
            this.state.error = `Kein Kunde mit ID ${context.getObjectId()} verfügbar.`;
        }

        this.state.configuration = context.getConfiguration();
        this.state.lanes = context.getLanes();
        this.state.tabWidgets = context.getLaneTabs();
        await this.prepareActions();
        this.prepareContentActions();

        await this.prepareTitle();

        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.configuration && this.state.customer) {
            const actions = await ActionFactory.getInstance().generateActions(
                this.state.configuration.generalActions, [this.state.customer]
            );
            WidgetService.getInstance().registerActions(this.state.instanceId, actions);
        }
    }

    private async prepareContentActions(): Promise<void> {
        if (this.state.configuration && this.state.customer) {
            this.state.contentActions = await ActionFactory.getInstance().generateActions(
                this.state.configuration.customerActions, [this.state.customer]
            );
        }
    }

    public async prepareTitle(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.title = await context.getDisplayText();

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
