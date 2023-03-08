/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { Context } from '../../../../../model/Context';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ReportChartWidgetConfiguration } from '../../../model/ReportChartWidgetConfiguration';
import { ChartWidgetService } from '../../core/ChartWidgetService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { BackendNotification } from '../../../../../model/BackendNotification';
import { IdService } from '../../../../../model/IdService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ReportDefinition } from '../../../../reporting/model/ReportDefinition';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private subscriber: IEventSubscriber;

    private chartWidgetConfig: ReportChartWidgetConfiguration;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        this.chartWidgetConfig = this.state.widgetConfiguration.configuration as ReportChartWidgetConfiguration;

        this.prepareTitle();
        await this.updateChart();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('MapLayer'),
            eventPublished: this.handleEvent.bind(this)
        };

        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_CREATED, this.subscriber);

        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_CREATED, this.subscriber);
    }

    private async handleEvent(data: BackendNotification, eventId: string): Promise<void> {
        if (data instanceof BackendNotification) {
            if (data.Namespace === 'ReportDefinition.Report') {
                const ids = data.ObjectID.split('::');
                if (ids.length === 2) {
                    const definitionId = Number(ids[0]);
                    if (this.chartWidgetConfig.reportDefinitionId === definitionId) {
                        this.updateChart();
                    }
                }
            }

        }
    }

    private async prepareTitle(): Promise<void> {
        this.state.title = this.state.widgetConfiguration?.title || 'Translatable#Report Chart';

        const definitionId = this.chartWidgetConfig.reportDefinitionId;
        if (this.chartWidgetConfig.useReportTitle && definitionId) {
            const reportDefinitions = await KIXObjectService.loadObjects<ReportDefinition>(
                KIXObjectType.REPORT_DEFINITION, [definitionId], null, null, true
            ).catch(() => []);

            if (reportDefinitions?.length) {
                this.state.title = reportDefinitions[0].Name;
            }
        }
    }

    private async updateChart(): Promise<void> {
        this.state.prepared = false;
        this.state.chartConfig = null;

        const chartConfig = this.chartWidgetConfig?.configuration.chartConfiguration;

        try {
            this.state.chartConfig = await ChartWidgetService.getInstance().prepareChartDataFromReport(
                chartConfig,
                this.chartWidgetConfig.reportDefinitionId,
                this.chartWidgetConfig.reportOutputFormat,
                this.chartWidgetConfig.formatConfiguration
            );
        } catch (error) {
            this.state.errorMessage = error;
        }

        this.state.prepared = true;
    }
}

module.exports = Component;