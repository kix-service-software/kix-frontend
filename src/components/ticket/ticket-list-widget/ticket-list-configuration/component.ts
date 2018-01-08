import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { TicketUtil } from '@kix/core/dist/browser/ticket/';
import { TicketProperty } from '@kix/core/dist/model/';
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { TicketListConfigurationComponentState } from './TicketListConfigurationComponentState';

class TicketListConfigurationComponent {

    public state: TicketListConfigurationComponentState;

    public onCreate(input: any): void {
        this.state = new TicketListConfigurationComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.configuration = DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);
        const th = await TranslationHandler.getInstance();
        for (const property of TicketUtil.getDisplayProperties()) {
            this.state.properties.push([property, th.getTranslation(property)]);
        }
        (this as any).setStateDirty('properties');
    }

    private isPropertySelected(property: string): boolean {
        return this.state.configuration.settings.properties.findIndex((p) => p === property) > -1;
    }

    private displayLimitChanged(event: any): void {
        this.state.configuration.settings.displayLimit = event.target.value;
    }

    private limitChanged(event: any): void {
        this.state.configuration.settings.limit = event.target.value;
    }

    private propertyChanged(event: any): void {
        this.state.configuration.settings.properties = [];
        for (const selectedProperty of event.target.selectedOptions) {
            this.state.configuration.settings.properties.push(selectedProperty.value);
        }
    }

    private showTotalCountChanged(event: any): void {
        const currentShowTotalCount = this.state.configuration.settings.showTotalCount;
        this.state.configuration.settings.showTotalCount = !currentShowTotalCount;
    }

    private saveConfiguration(): void {
        DashboardStore.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.configuration);
        ApplicationStore.getInstance().toggleDialog();
    }

}

module.exports = TicketListConfigurationComponent;
