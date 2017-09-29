import { ChartDataRow } from './data/ChartDataRow';
import { IChart } from './IChart';

declare var d3;

export class PieChartWithD3 implements IChart {

    public createChart(elementId: string, chartData: ChartDataRow[]): void {

        // get svg
        const svg = d3.select('#' + elementId);
        const width = +svg.attr("width") || 300;
        const height = +svg.attr("height") || 300;
        const radius = width / 2;
        const defaultColor =
            d3.scaleOrdinal().range(["#a52f86", "#6d86cc", "#fbc80c", "#fb990c", "#fb2e0c", "#c0fb0c"]);
        const data = [];

        // prepare data
        chartData.forEach((dataEl) => {
            data.push({
                label: dataEl.label,
                value: +dataEl.rowValue[0].value
            });
        });

        // define arc of pie (position, size)
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius - 10);

        // define label arc of pie
        const labelArc = d3.arc()
            .innerRadius(radius - 40)
            .outerRadius(radius - 40);

        // create pie with values
        const pie = d3.pie()
            .sort(null)
            .value((d) => {
                return d.value;
            });

        // add one group in the middle to svg
        const group = svg.append("g")
            .attr("transform", "translate(" + radius + "," + radius + ")");


        // add groups for each data element, eventual arcs
        const arcs = group.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        // add arc to arc-groups
        arcs.append("path")
            .attr("d", arc)
            .style("fill", (d, i) => {
                return defaultColor(i);
            });

        // add label to arc-groups
        arcs.append("text")
            .attr("transform", (d) => {
                return "translate(" + labelArc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text((d) => {
                return d.data.label;
            });
    }
}

const PieChart = new PieChartWithD3();

export {
    PieChart
};
