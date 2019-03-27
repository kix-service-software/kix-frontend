import { ComponentState } from './ComponentState';
import { ContextService } from "../../../../core/browser/context";
import { IdService } from '../../../../core/browser';
import { KIXObject, ConfigItem } from '../../../../core/model';
import { ConfigItemChartConfiguration, ConfigItemChartFactory } from '../../../../core/browser/cmdb';

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
                scrollInformationChanged: () => { return; },
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

        this.cmdbChartConfiguration.chartConfiguration.data.labels = data[0];
        this.cmdbChartConfiguration.chartConfiguration.data.datasets = data[1];
        this.state.chartConfig = this.cmdbChartConfiguration.chartConfiguration;
    }

}

module.exports = Component;
