/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ConfigItemChartWidgetConfiguration, ConfigItemChartFactory } from '../../core';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { ConfigItem } from '../../../model/ConfigItem';

class Component {

    public state: ComponentState;

    private cmdbChartConfiguration: ConfigItemChartWidgetConfiguration;

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
        this.cmdbChartConfiguration = this.state.widgetConfiguration.configuration;

        this.initChartConfig();

        if (this.state.widgetConfiguration.contextDependent) {
            this.cmdbChartConfiguration.configuration.chartConfiguration.data.labels = [];
            this.cmdbChartConfiguration.configuration.chartConfiguration.data.datasets[0].data = [];

            currentContext.registerListener('CMDBChartComponent' + IdService.generateDateBasedId(), {
                explorerBarToggled: () => { return; },
                sidebarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                scrollInformationChanged: () => { return; },
                filteredObjectListChanged: this.contextFilteredObjectListChanged.bind(this),
                additionalInformationChanged: () => { return; }
            });

            this.contextFilteredObjectListChanged(
                KIXObjectType.CONFIG_ITEM, currentContext.getFilteredObjectList(KIXObjectType.CONFIG_ITEM)
            );
        }

        this.state.chartConfig = this.cmdbChartConfiguration.configuration.chartConfiguration;
    }

    private initChartConfig(): void {
        if (!this.cmdbChartConfiguration.configuration.chartConfiguration.data) {
            this.cmdbChartConfiguration.configuration.chartConfiguration.data = {
                datasets: [{ data: [] }],
                labels: []
            };
        }

        if (!this.cmdbChartConfiguration.configuration.chartConfiguration.data.datasets) {
            this.cmdbChartConfiguration.configuration.chartConfiguration.data.datasets = [{ data: [] }];
        }

        if (!this.cmdbChartConfiguration.configuration.chartConfiguration.data.labels) {
            this.cmdbChartConfiguration.configuration.chartConfiguration.data.labels = [];
        }
    }

    private async contextFilteredObjectListChanged(objectType: KIXObjectType, objectList: KIXObject[]): Promise<void> {
        this.state.chartConfig = null;
        const data = await ConfigItemChartFactory.getInstance().prepareData(
            this.cmdbChartConfiguration.property, (objectList as ConfigItem[])
        );

        this.cmdbChartConfiguration.configuration.chartConfiguration.data.labels = data[0];
        this.cmdbChartConfiguration.configuration.chartConfiguration.data.datasets = data[1];
        this.state.chartConfig = this.cmdbChartConfiguration.configuration.chartConfiguration;
    }

}

module.exports = Component;
