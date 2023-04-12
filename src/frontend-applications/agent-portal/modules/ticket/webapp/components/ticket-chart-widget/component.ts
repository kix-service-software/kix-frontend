/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextUIEvent } from '../../../../base-components/webapp/core/ContextUIEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';

class Component {

    public state: ComponentState;
    private ticketChartConfiguration: TicketChartWidgetConfiguration;
    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? await currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        if (this.state.widgetConfiguration) {
            this.state.title = this.state.widgetConfiguration.title;
            this.ticketChartConfiguration =
                this.state.widgetConfiguration.configuration as TicketChartWidgetConfiguration;

            this.initChartConfig();

            if (this.state.widgetConfiguration.contextDependent) {
                this.ticketChartConfiguration.configuration.chartConfiguration.data.labels = [];
                this.ticketChartConfiguration.configuration.chartConfiguration.data.datasets[0].data = [];

                currentContext.registerListener('TicketChartComponent' + IdService.generateDateBasedId(), {
                    sidebarLeftToggled: (): void => { return; },
                    sidebarRightToggled: (): void => { return; },
                    objectChanged: (): void => { return; },
                    objectListChanged: () => { return; },
                    scrollInformationChanged: () => { return; },
                    filteredObjectListChanged: this.contextFilteredObjectListChanged.bind(this),
                    additionalInformationChanged: (): void => { return; }
                });

                this.contextFilteredObjectListChanged(
                    KIXObjectType.TICKET, currentContext.getFilteredObjectList(KIXObjectType.TICKET)
                );

                this.subscriber = {
                    eventSubscriberId: IdService.generateDateBasedId(this.state.instanceId),
                    eventPublished: (data: any, eventId: string): void => {
                        if (eventId === ContextUIEvent.RELOAD_OBJECTS && data === KIXObjectType.TICKET) {
                            // this.state.loading = true;
                        }
                    }
                };
                EventService.getInstance().subscribe(ContextUIEvent.RELOAD_OBJECTS, this.subscriber);
            } else {
                const tickets = await KIXObjectService.loadObjects<Ticket>(
                    KIXObjectType.TICKET, null, this.ticketChartConfiguration.loadingOptions
                );
                this.contextFilteredObjectListChanged(KIXObjectType.TICKET, tickets);
            }
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextUIEvent.RELOAD_OBJECTS, this.subscriber);
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
