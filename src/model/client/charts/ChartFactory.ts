import { ChartConfiguration } from './';
import { BarChart } from './BarChart';
import { ChartDataPreparer } from './data/ChartDataPreparer';
import { PieChart } from './PieChart';
import { StackedBarChart } from './StackedBarChart';
import { StackedBarChartHorizontal } from './StackedBarChartHorizontal';

/**
 * Generic abstract class to create charts.
 *
 * The class provides generic methods to add charts to the DOM.
 */
export class ChartFactory {

    /**
     * Prepares data for and invokes the createChart method of the requested chart type
     *
     * @param svgId value of the id attribute of the DOM element for the chart (e.g. the svg)
     * @param configuration object of the widget configuration as {@link ChartConfiguration}
     *
     * @return nothing
     */
    public static createChart(svgId: string, configuration: ChartConfiguration): void {

        // TODO: have to get data from search templates in configruation and give it to preparer?
        const chartData = ChartDataPreparer.getData(configuration.chartType);

        // TODO: use extension for more flexible approach
        if (chartData) {
            if (configuration.chartType === 'pie') {
                PieChart.createChart(svgId, chartData);
            }
            if (configuration.chartType === 'bar') {
                BarChart.createChart(svgId, chartData);
            }
            if (configuration.chartType === 'stacked-bar') {
                StackedBarChart.createChart(svgId, chartData);
            }
            if (configuration.chartType === 'stacked-bar-horizontal') {
                StackedBarChartHorizontal.createChart(svgId, chartData);
            }
        }
    }
}
