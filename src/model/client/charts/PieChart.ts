import { IChart } from './IChart';
declare var d3: any;
// import * as d3 from 'd3';

export class PieChartD3 implements IChart {

    public createChart(element: string, data: any): any {

        const width = data.width || 300;
        const height = data.height || 300;
        const radius = width / 2;
        const color = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "red", "blue"]);

        const values = [];
        const labels = [];
        for (const dataEl of data.data) {
            labels.push(dataEl.label);
            values.push(dataEl.value);
        }

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius - 10);

        const labelArc = d3.arc()
            .innerRadius(radius - 40)
            .outerRadius(radius - 40);

        const pie = d3.pie()
            .sort(null)
            .value((d: any) => {
                return d;
            });

        const svg = d3.select(element)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + radius + "," + radius + ")");


        const arcs = svg.selectAll(".arc")
            .data(pie(values))
            .enter().append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .style("fill", (d: any) => {
                return color(d.data);
            });

        arcs.append("text")
            .attr("transform", (d: any) => {
                return "translate(" + labelArc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text((d: any) => {
                return d.data;
            });
        // .text(function (d, i) { return data[i].label; });

        return svg;

    }
}

const PieChart = new PieChartD3();

export {
    PieChart
};
