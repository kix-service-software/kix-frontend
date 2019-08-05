/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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

        this.initChartConfig();

        if (this.state.widgetConfiguration.contextDependent) {
            this.cmdbChartConfiguration.chartConfiguration.data.labels = [];
            this.cmdbChartConfiguration.chartConfiguration.data.datasets[0].data = [];

            currentContext.registerListener('CMDBChartComponent' + IdService.generateDateBasedId(), {
                explorerBarToggled: () => { return; },
                sidebarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                scrollInformationChanged: () => { return; },
                filteredObjectListChanged: this.contextFilteredObjectListChanged.bind(this)
            });

            this.contextFilteredObjectListChanged(currentContext.getFilteredObjectList());
        }

        this.state.chartConfig = this.cmdbChartConfiguration.chartConfiguration;
    }

    private initChartConfig(): void {
        if (!this.cmdbChartConfiguration.chartConfiguration.data) {
            this.cmdbChartConfiguration.chartConfiguration.data = {
                datasets: [{ data: [] }],
                labels: []
            };
        }

        if (!this.cmdbChartConfiguration.chartConfiguration.data.datasets) {
            this.cmdbChartConfiguration.chartConfiguration.data.datasets = [{ data: [] }];
        }

        if (!this.cmdbChartConfiguration.chartConfiguration.data.labels) {
            this.cmdbChartConfiguration.chartConfiguration.data.labels = [];
        }
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
