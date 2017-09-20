import { IChart } from './IChart';
declare var d3;

export class PieChartWithD3 implements IChart {

    public createChart(element: string, data: any): void {

        const width = data.width || 300;
        const height = data.height || 300;
        const radius = width / 2;
        const color = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "red", "blue"]);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius - 10);

        const labelArc = d3.arc()
            .innerRadius(radius - 40)
            .outerRadius(radius - 40);

        const pie = d3.pie()
            .sort(null)
            .value((d) => {
                return d.value;
            });

        const svg = d3.select('#' + element)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + radius + "," + radius + ")");


        const arcs = svg.selectAll(".arc")
            .data(pie(data.data))
            .enter().append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .style("fill", (d, i) => {
                return color(i);
            });

        arcs.append("text")
            .attr("transform", (d) => {
                return "translate(" + labelArc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text((d) => {
                console.log(d);
                return d.data.label;
            });
    }
}

const PieChart = new PieChartWithD3();

export {
    PieChart
};
