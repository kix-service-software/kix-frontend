import { IChart } from './IChart';

declare var d3;

export class PieChartWithD3 implements IChart {

    public createChart(elementId: string, chartData: any): void {

        const width = chartData.width || 300;
        const height = chartData.height || 300;
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

        // create pie with values
        const pie = d3.pie()
            .sort(null)
            .value((d) => {
                return d.value;
            });

        // create svg with one group in the middle
        const svg = d3.select('#' + elementId)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + radius + "," + radius + ")");


        // add groups for each data element, eventual arcs
        const arcs = svg.selectAll(".arc")
            .data(pie(chartData.data))
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
