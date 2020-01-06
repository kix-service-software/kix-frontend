/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TicketChartWidgetConfiguration, TicketChartFactory } from '../../core';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Ticket } from '../../../model/Ticket';
import { KIXObject } from '../../../../../model/kix/KIXObject';

class Component {


    public state: ComponentState;
    private ticketChartConfiguration: TicketChartWidgetConfiguration;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : 'Tickets';
        this.ticketChartConfiguration = this.state.widgetConfiguration.configuration;

        this.initChartConfig();

        if (this.state.widgetConfiguration.contextDependent) {
            this.ticketChartConfiguration.configuration.chartConfiguration.data.labels = [];
            this.ticketChartConfiguration.configuration.chartConfiguration.data.datasets[0].data = [];

            currentContext.registerListener('TicketChartComponent' + IdService.generateDateBasedId(), {
                explorerBarToggled: () => { return; },
                sidebarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: () => { return; },
                scrollInformationChanged: () => { return; },
                filteredObjectListChanged: this.contextFilteredObjectListChanged.bind(this),
                additionalInformationChanged: () => { return; }
            });

            this.contextFilteredObjectListChanged(
                KIXObjectType.TICKET, currentContext.getFilteredObjectList(KIXObjectType.TICKET)
            );
        } else {
            const tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, null, this.ticketChartConfiguration.loadingOptions
            );
            this.contextFilteredObjectListChanged(KIXObjectType.TICKET, tickets);
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

}

module.exports = Component;
