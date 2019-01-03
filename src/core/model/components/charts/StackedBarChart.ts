import { ChartDataRow } from './data/ChartDataRow';
import { IChart } from './IChart';

declare const d3;

// TODO: execlude?
export interface IPreparedData {
    columns: any[];
    data: any[];
}

export class D3StackedBarChart implements IChart {

    public createChart(domId: string, chartData: ChartDataRow[]): void {

        const svg = d3.select("#" + domId);
        const margin = { top: 20, right: 60, bottom: 30, left: 40 };
        const width = (+svg.attr("width") || 400) - margin.left - margin.right;
        const height = (+svg.attr("height") || 150) - margin.top - margin.bottom;
        const defaultColor =
            d3.scaleOrdinal().range(["#a52f86", "#6d86cc", "#fbc80c", "#fb990c", "#fb2e0c", "#c0fb0c"]);
        const preparedData: IPreparedData = this.prepareData(chartData);
        const group = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // add x-axis
        const x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1)
            .align(0.1);

        // add y-axis
        const y = d3.scaleLinear()
            .rangeRound([height, 0]);

        const color = defaultColor;

        const stack = d3.stack()
            .offset(d3.stackOffsetExpand);

        // add labels to x-axis
        x.domain(preparedData.data.map((d) => {
            return d.label;
        }));

        // get color for each column (without label)
        color.domain(preparedData.columns);

        // add serie (for each color) - container
        const serie = group.selectAll(".serie")
            .data(stack.keys(preparedData.columns)(preparedData.data))
            .enter().append("g")
            .attr("class", "serie")
            .attr("fill", (d) => {
                return color(d.key);
            });

        // add rects
        serie.selectAll("rect")
            .data((d) => {
                return d;
            })
            .enter().append("rect")
            .attr("x", (d) => {
                return x(d.data.label);
            })
            .attr("y", (d) => {
                return y(d[1]);
            })
            .attr("height", (d) => {
                return y(d[0]) - y(d[1]);
            })
            .attr("width", x.bandwidth());

        // define position of x-axis
        group.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // define position of y-axis
        group.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10, "%"));

        // TODO: style "legend" like in the mockups
        // add "legend" for columns (position)
        const legend = serie.append("g")
            .attr("class", "legend")
            .attr("transform", (d) => {
                d = d[d.length - 1];
                return "translate(" + (x(d.data.label) + x.bandwidth()) + "," + ((y(d[0]) + y(d[1])) / 2) + ")";
            });
        // add a line and the text for "legend"
        legend.append("line")
            .attr("x1", -6)
            .attr("x2", 6)
            .attr("stroke", "#000");
        legend.append("text")
            .attr("x", 9)
            .attr("dy", "0.35em")
            .attr("fill", "#000")
            .style("font", "10px sans-serif")
            .text((d) => {
                return d.key;
            });
    }

    // TODO: execlude?
    private prepareData(chartData: ChartDataRow[]): IPreparedData {
        const data = [];
        const columns = [];
        chartData.forEach((dataEl) => {
            const subData = {};
            dataEl.rowValue.forEach((row) => {
                if (columns.indexOf(row.label) === -1) {
                    columns.push(row.label);
                }
                subData[row.label] = row.value[0].value;
            });
            data.push({ label: dataEl.label, ...subData });
        });
        return { data, columns };
    }
}

const StackedBarChart = new D3StackedBarChart();

export {
    StackedBarChart
};
