import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';
import { TicketUtil } from '@kix/core/dist/browser/ticket/';
import { TicketProperty } from '@kix/core/dist/model/';
import { TicketListConfigurationComponentState } from './TicketListConfigurationComponentState';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

class TicketListConfigurationComponent {

    public state: TicketListConfigurationComponentState;

    public onCreate(input: any): void {
        this.state = new TicketListConfigurationComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getContext();
        this.state.configuration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        (this as any).setStateDirty('properties');
    }

    private isPropertySelected(property: string): boolean {
        return false; // this.state.configuration.settings.properties.findIndex((p) => p === property) > -1;
    }

    private displayLimitChanged(event: any): void {
        this.state.configuration.settings.displayLimit = event.target.value;
    }

    private limitChanged(event: any): void {
        this.state.configuration.settings.limit = event.target.value;
    }

    private propertyChanged(event: any): void {
        // this.state.configuration.settings.properties = [];
        // for (const selectedProperty of event.target.selectedOptions) {
        //     this.state.configuration.settings.properties.push(selectedProperty.value);
        // }
    }

    private showTotalCountChanged(event: any): void {
        const currentShowTotalCount = this.state.configuration.settings.showTotalCount;
        this.state.configuration.settings.showTotalCount = !currentShowTotalCount;
    }

    private saveConfiguration(): void {
        DashboardService.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.configuration);
        ApplicationStore.getInstance().toggleMainDialog();
    }

}

module.exports = TicketListConfigurationComponent;
