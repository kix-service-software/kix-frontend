import { ChartDataRow } from './data/ChartDataRow';
import { IChart } from './IChart';

declare var d3;

export class D3BarChart implements IChart {

    public createChart(domId: string, chartData: ChartDataRow[]): void {

        const svg = d3.select('#' + domId);
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = (+svg.attr("width") || 400) - margin.left - margin.right;
        const height = (+svg.attr("height") || 150) - margin.top - margin.bottom;
        const defaultColor =
            d3.scaleOrdinal().range(["#a52f86", "#6d86cc", "#fbc80c", "#fb990c", "#fb2e0c", "#c0fb0c"]);
        const data = [];

        // prepare data
        chartData.forEach((dataEl) => {
            data.push({
                label: dataEl.label + ' (' + +dataEl.rowValue[0].value + ')',
                value: +dataEl.rowValue[0].value
            });
        });

        // append a 'group' element to 'svg'
        // and moves the 'group' element to the top left margin
        const group = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // set the ranges/ define the axis
        const xAxis = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
        const yAxis = d3.scaleLinear()
            .range([height, 0]);

        // scale the range of the data in the domains
        xAxis.domain(data.map((d) => {
            return d.label;
        }));
        yAxis.domain([
            0, d3.max(data, (d) => {
                return d.value;
            })
        ]);

        // append the rectangles for the bar chart
        group.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d) => {
                return xAxis(d.label);
            })
            .attr("width", xAxis.bandwidth())
            .attr("y", (d) => {
                return yAxis(d.value);
            })
            .attr("height", (d) => {
                return height - yAxis(d.value);
            })
            .style('fill', (d) => {
                return defaultColor(data.indexOf(d));
            });

        // add the x axis
        group.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xAxis));

        // add the y axis
        group.append("g")
            .call(d3.axisLeft(yAxis));
    }
}

const BarChart = new D3BarChart();

export {
    BarChart
};
