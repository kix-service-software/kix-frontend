import { ComponentState } from './ComponentState';
import { ContextService } from "@kix/core/dist/browser/context";
import { TicketChartConfiguration, TicketChartFactory } from '@kix/core/dist/browser/ticket';
import { IdService } from '@kix/core/dist/browser';
import { KIXObject, Ticket } from '@kix/core/dist/model';

class Component {


    public state: ComponentState;
    private ticketChartConfiguration: TicketChartConfiguration;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : 'Tickets';
        this.ticketChartConfiguration = this.state.widgetConfiguration.settings;

        if (this.state.widgetConfiguration.contextDependent) {
            this.ticketChartConfiguration.chartConfiguration.data.labels = [];
            this.ticketChartConfiguration.chartConfiguration.data.datasets[0].data = [];

            currentContext.registerListener('TicketChartComponent' + IdService.generateDateBasedId(), {
                explorerBarToggled: () => { return; },
                sidebarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                filteredObjectListChanged: this.contextFilteredObjectListChanged.bind(this)
            });
        }

        this.state.chartConfig = this.ticketChartConfiguration.chartConfiguration;
    }

    private contextFilteredObjectListChanged(objectList: KIXObject[]): void {
        this.state.chartConfig = null;
        const data = TicketChartFactory.getInstance().prepareData(
            this.ticketChartConfiguration.property, (objectList as Ticket[])
        );

        const labels = [];
        const newData = [];
        data.forEach((count, label) => {
            labels.push(label);
            newData.push(count);
        });

        this.ticketChartConfiguration.chartConfiguration.data.labels = labels;
        this.ticketChartConfiguration.chartConfiguration.data.datasets[0].data = newData;
        this.state.chartConfig = this.ticketChartConfiguration.chartConfiguration;
    }

}

module.exports = Component;
