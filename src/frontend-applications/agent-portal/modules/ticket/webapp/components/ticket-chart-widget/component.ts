/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TicketChartWidgetConfiguration, TicketChartFactory } from '../../core';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Ticket } from '../../../model/Ticket';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public state: ComponentState;
    private ticketChartConfiguration: TicketChartWidgetConfiguration;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        if (this.state.widgetConfiguration) {
            this.state.title = this.state.widgetConfiguration.title;
            this.ticketChartConfiguration =
                this.state.widgetConfiguration.configuration as TicketChartWidgetConfiguration;

            this.initChartConfig();

            if (this.state.widgetConfiguration.contextDependent) {
                this.ticketChartConfiguration.configuration.chartConfiguration.data.labels = [];
                this.ticketChartConfiguration.configuration.chartConfiguration.data.datasets[0].data = [];

                this.context?.registerListener('TicketChartComponent' + IdService.generateDateBasedId(), {
                    sidebarLeftToggled: (): void => { return; },
                    sidebarRightToggled: (): void => { return; },
                    objectChanged: (): void => { return; },
                    objectListChanged: () => { return; },
                    scrollInformationChanged: () => { return; },
                    filteredObjectListChanged: this.contextFilteredObjectListChanged.bind(this),
                    additionalInformationChanged: (): void => { return; }
                });

                this.contextFilteredObjectListChanged(
                    KIXObjectType.TICKET, this.context?.getFilteredObjectList(KIXObjectType.TICKET)
                );
            } else {
                const tickets = await KIXObjectService.loadObjects<Ticket>(
                    KIXObjectType.TICKET, null, this.ticketChartConfiguration.loadingOptions
                );
                this.contextFilteredObjectListChanged(KIXObjectType.TICKET, tickets);
            }
        }
    }

    private initChartConfig(): void {
        if (!this.ticketChartConfiguration.configuration.chartConfiguration.data) {
            this.ticketChartConfiguration.configuration.chartConfiguration.data = {
                datasets: [{ data: [] }],
                labels: []
            };
        }

        if (!this.ticketChartConfiguration.configuration.chartConfiguration.data.datasets) {
            this.ticketChartConfiguration.configuration.chartConfiguration.data.datasets = [{ data: [] }];
        }

        if (!this.ticketChartConfiguration.configuration.chartConfiguration.data.labels) {
            this.ticketChartConfiguration.configuration.chartConfiguration.data.labels = [];
        }
    }

    private async contextFilteredObjectListChanged(objectType: KIXObjectType, objectList: KIXObject[]): Promise<void> {
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

        this.ticketChartConfiguration.configuration.chartConfiguration.data.labels = labels;
        this.ticketChartConfiguration.configuration.chartConfiguration.data.datasets[0].data = newData;
        this.state.chartConfig = this.ticketChartConfiguration.configuration.chartConfiguration;
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
