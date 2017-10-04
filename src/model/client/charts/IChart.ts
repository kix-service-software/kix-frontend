import { ChartDataRow } from './data/ChartDataRow';

/**
 * interface for all charts.
 *
 * It defines the rquired methods to make create add chart to the DOM.
 */
export interface IChart {

    /**
     * Creates a chart of requested type
     *
     * @param domId value of the id attribute of the DOM element for the chart (e.g. the svg)
     * @param data array of {@link ChartDataRow} with the prepared data
     *
     * @return nothing
     */
    createChart(domId: string, chartData: ChartDataRow[]): void;
}
