import { BarChart } from './BarChart';
import { ChartDataRow } from './data/ChartDataRow';
import { PieChart } from './PieChart';
import { StackedBarChart } from './StackedBarChart';
import { StackedBarChartHorizontal } from './StackedBarChartHorizontal';

// TODO: use extension for more flexible approach
export class ChartFactory {
    public static createChart(svgId: string, type: string, chartData: ChartDataRow[]): void {

        if (type === 'pie') {
            PieChart.createChart(svgId, chartData);
        }
        if (type === 'bar') {
            BarChart.createChart(svgId, chartData);
        }
        if (type === 'stacked-bar') {
            StackedBarChart.createChart(svgId, chartData);
        }
        if (type === 'stacked-bar-horizontal') {
            StackedBarChartHorizontal.createChart(svgId, chartData);
        }
    }
}
