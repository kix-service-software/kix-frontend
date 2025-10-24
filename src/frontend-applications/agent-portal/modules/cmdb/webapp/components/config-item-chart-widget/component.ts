/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ContextUIEvent } from '../../../../base-components/webapp/core/ContextUIEvent';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public state: ComponentState;
    private cmdbChartConfiguration: ConfigItemChartWidgetConfiguration;

    public onCreate(input: any): void {
        super.onCreate(input, 'config-item-chart-widget');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? await currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : 'CMDB';
        this.cmdbChartConfiguration =
            this.state.widgetConfiguration.configuration as ConfigItemChartWidgetConfiguration;

        this.initChartConfig();

        if (this.state.widgetConfiguration.contextDependent) {
            this.cmdbChartConfiguration.configuration.chartConfiguration.data.labels = [];
            this.cmdbChartConfiguration.configuration.chartConfiguration.data.datasets[0].data = [];

            this.context?.registerListener('CMDBChartComponent' + IdService.generateDateBasedId(), {
                sidebarLeftToggled: (): void => { return; },
                sidebarRightToggled: (): void => { return; },
                objectChanged: (): void => { return; },
                objectListChanged: () => { return; },
                scrollInformationChanged: () => { return; },
                filteredObjectListChanged: this.contextFilteredObjectListChanged.bind(this),
                additionalInformationChanged: (): void => { return; }
            });

            this.contextFilteredObjectListChanged(
                KIXObjectType.CONFIG_ITEM, currentContext.getFilteredObjectList(KIXObjectType.CONFIG_ITEM)
            );

            super.registerEventSubscriber(
                function (data: any, eventId: string): void {
                    if (data === KIXObjectType.CONFIG_ITEM) {
                        this.state.loading = true;
                    }
                },
                [ContextUIEvent.RELOAD_OBJECTS]
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
        this.state.loading = false;
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
