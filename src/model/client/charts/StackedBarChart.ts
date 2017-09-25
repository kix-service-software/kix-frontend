import { IChart } from './IChart';

declare const d3;

export class StackedBarChartWithD3 implements IChart {

    public createChart(elementId: string, chartData: any): void {

        const margin = { top: 20, right: 60, bottom: 30, left: 40 };
        const width = (chartData.width || 300) - margin.left - margin.right;
        const height = (chartData.height || 300) - margin.top - margin.bottom;
        const defaultColor = d3.scaleOrdinal().range(["red", "blue", "green", "yellow"]);

        // add svg element and a group
        const svg = d3.select("#" + elementId).append('svg')
            .attr('height', (chartData.heigth || 300))
            .attr('width', (chartData.width || 300));
        const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

        // TODO: prepare given data, this is just an example
        const columns = ['label', 'hoch', 'mittel', 'niedrig'];
        const data = [
            { label: 'Allgemein', hoch: 15, mittel: 65, niedrig: 20 },
            { label: 'Beobachten', hoch: 25, mittel: 45, niedrig: 30 },
            { label: 'Verantwortlich', hoch: 15, mittel: 30, niedrig: 55 }
        ];

        // add labels to x-axis
        x.domain(data.map((d) => {
            return d.label;
        }));
        // get color for each column (without label)
        color.domain(columns.slice(1));

        // add serie (for each color) - container
        const serie = g.selectAll(".serie")
            .data(stack.keys(columns.slice(1))(data))
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
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // define position of y-axis
        g.append("g")
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

    private prepareData(data: any): any {
        const preparedData = {};
        return preparedData;
    }
}

const StackedBarChart = new StackedBarChartWithD3();

export {
    StackedBarChart
};
