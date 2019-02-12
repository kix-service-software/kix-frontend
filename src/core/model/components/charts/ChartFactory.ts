import { BarChart } from './BarChart';
import { ChartDataPreparer } from './data/ChartDataPreparer';
import { ChartSettings } from '.';
import { PieChart } from './PieChart';
import { StackedBarChart } from './StackedBarChart';
import { StackedBarChartHorizontal } from './StackedBarChartHorizontal';

import { TicketProperty } from '../..';
import { ContextService, AbstractContextServiceListener } from '../../../browser/context';
import { KIXObjectType } from '../../kix';

/**
 * Generic abstract class to create charts.
 *
 * The class provides generic methods to add charts to the DOM.
 */
export class ChartFactory extends AbstractContextServiceListener {

    private searchResults: any[] = [];
    private filteredSearchResults: any[] = [];
    private isPrepared: boolean = false;

    /**
     * constructor
     *
     * @param svgId value of the id attribute of the DOM element for the chart (e.g. the svg)
     * @param settings object of the chart settings as {@link ChartSettings}
     * @param contextDependent boolean, if chart is dependent on a context
     *
     * @return void
     */
    public constructor(
        private svgId: string,
        private settings: ChartSettings,
        private contextDependent: boolean = false
    ) {
        super();
        ContextService.getInstance().registerListener(this);
        this.loadTickets();
    }

    private async loadTickets(): Promise<void> {
        let properties: string[] = [TicketProperty.QUEUE_ID];
        if (this.settings.hasOwnProperty('attributes')) {
            properties = [...properties, ...this.settings.attributes];
        }

        /*
        this.searchResults = await TicketService.getInstance().loadTickets(this.settings.templateId, 500, properties);
        this.filteredSearchResults = this.searchResults;
        */

        this.drawChart();
    }

    // private contextServiceNotified(requestId: string, type: ContextNotification, ...args): void {
    //     if (type === ContextNotification.CONTEXT_FILTER_CHANGED) {
    //         const contextFilter: = args[0];
    //         if (this.contextDependent && contextFilter) {
    //             this.filterTickets(contextFilter);
    //             this.drawChart();
    //         }
    //     }
    // }

    /**
     * updates relevant config
     *
     * @param settings object of the chart settings as {@link ChartSettings}
     * @param contextDependent boolean, if chart is dependent on a context
     *
     * @return void
     */
    public updateConfig(settings: ChartSettings, contextDependent: boolean): void {
        this.settings = settings;
        this.contextDependent = contextDependent;
        this.isPrepared = false;
    }

    /**
     * Prepares relevant data for and invokes the createChart method of the requested chart type
     *
     * @param force optional - boolean if draw should be forced
     * //TODO: 'force' ggf. wieder entfernen, wenn StateListener auf bestimmte Updated reagieren können
     *
     * @return void
     */
    public drawChart() {
        if (this.filteredSearchResults && this.settings) {
            const chartData = ChartDataPreparer.getData(this.filteredSearchResults, this.settings);

            const element = document.getElementById(this.svgId);
            if (element) {
                element.innerHTML = '';

                // TODO: Typ-'extensions' verwenden (wenn dann vorhanden) --> flexibler/erweiterbar
                if (chartData) {
                    if (this.settings.chartType === 'pie') {
                        PieChart.createChart(this.svgId, chartData);
                    }
                    if (this.settings.chartType === 'bar') {
                        BarChart.createChart(this.svgId, chartData);
                    }
                    if (this.settings.chartType === 'stacked-bar') {
                        StackedBarChart.createChart(this.svgId, chartData);
                    }
                    if (this.settings.chartType === 'stacked-bar-horizontal') {
                        StackedBarChartHorizontal.createChart(this.svgId, chartData);
                    }
                }
            }
        }
    }

    private filterTickets(contextFilter): void {
        if (
            this.searchResults &&
            contextFilter &&
            contextFilter.objectValue &&
            contextFilter.objectType === KIXObjectType.QUEUE
        ) {
            this.filteredSearchResults
                = this.searchResults.filter((t) => t.QueueID === contextFilter.objectValue);
        }
    }
}
