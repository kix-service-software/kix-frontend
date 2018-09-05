import { ComponentState } from './ComponentState';
import { ContextService } from "@kix/core/dist/browser/context";
import { IdService } from '@kix/core/dist/browser';
import { KIXObject, ConfigItem } from '@kix/core/dist/model';
import { ConfigItemChartConfiguration, ConfigItemChartFactory } from '@kix/core/dist/browser/cmdb';

class Component {

    public state: ComponentState;

    private cmdbChartConfiguration: ConfigItemChartConfiguration;

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

        this.state.title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : 'CMDB';
        this.cmdbChartConfiguration = this.state.widgetConfiguration.settings;

        if (this.state.widgetConfiguration.contextDependent) {
            this.cmdbChartConfiguration.chartConfiguration.data.labels = [];
            if (this.cmdbChartConfiguration.chartConfiguration.data.datasets.length) {
                this.cmdbChartConfiguration.chartConfiguration.data.datasets[0].data = [];
            } else {
                this.cmdbChartConfiguration.chartConfiguration.data.datasets.push({ data: [] });
            }

            currentContext.registerListener('CMDBChartComponent' + IdService.generateDateBasedId(), {
                explorerBarToggled: () => { return; },
                sidebarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                filteredObjectListChanged: this.contextFilteredObjectListChanged.bind(this)
            });
        }

        this.state.chartConfig = this.cmdbChartConfiguration.chartConfiguration;
    }

    private async contextFilteredObjectListChanged(objectList: KIXObject[]): Promise<void> {
        this.state.chartConfig = null;
        const data = await ConfigItemChartFactory.getInstance().prepareData(
            this.cmdbChartConfiguration.property, (objectList as ConfigItem[])
        );

        const labels = [];
        const datasets = [];
        data.forEach((count, label) => {
            labels.push(label);

            count.forEach((c, index) => {
                if (!datasets[index]) {
                    datasets[index] = {
                        backgroundColor: this.getRandomColor(),
                        data: [c]
                    };
                } else {
                    datasets[index].data.push(c);
                }
            });
        });

        this.cmdbChartConfiguration.chartConfiguration.data.labels = labels;
        this.cmdbChartConfiguration.chartConfiguration.data.datasets = datasets;
        this.state.chartConfig = this.cmdbChartConfiguration.chartConfiguration;
    }

    private getRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

}

module.exports = Component;
