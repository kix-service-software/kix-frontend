import { ChartDataRow } from './data/ChartDataRow';
import { IChart } from './IChart';

declare var d3;

export class PieChartWithD3 implements IChart {

    public createChart(elementId: string, chartData: ChartDataRow[]): void {

        // get svg
        const svg = d3.select('#' + elementId);
        const width = +svg.attr("width") || 600;
        const height = +svg.attr("height") || 600;
        const radius = width / 2;
        const defaultColor = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "red", "blue"]);

        // define arc of pie (position, size)
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius - 10);

        // define label arc of pie
        const labelArc = d3.arc()
            .innerRadius(radius - 40)
            .outerRadius(radius - 40);

        const data = [];
        chartData.forEach((row) => {
            data.push({
                label: row.label,
                value: row.value[0].value
            });
        });

        // create pie with values
        const pie = d3.pie()
            .sort(null)
            .value((d) => {
                console.log(d);
                return d.value[0];
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
