import { ComponentState } from './ComponentState';
import { ContextService } from "../../../../core/browser/context";
import { TicketChartConfiguration, TicketChartFactory } from '../../../../core/browser/ticket';
import { IdService } from '../../../../core/browser';
import { KIXObject, Ticket } from '../../../../core/model';

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
                scrollInformationChanged: () => { return; },
                filteredObjectListChanged: this.contextFilteredObjectListChanged.bind(this)
            });
        }

        this.state.chartConfig = this.ticketChartConfiguration.chartConfiguration;
    }

    private async contextFilteredObjectListChanged(objectList: KIXObject[]): Promise<void> {
        this.state.chartConfig = null;
        const data = await TicketChartFactory.getInstance().prepareData(
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
