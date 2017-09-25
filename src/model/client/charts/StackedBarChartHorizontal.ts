import { IChart } from './IChart';

declare const d3;

export class StackedBarChartHorizontalWithD3 implements IChart {

    public createChart(elementId: string, chartData: any): void {

        const margin = { top: 20, right: 40, bottom: 30, left: 60 };
        const width = (chartData.width || 300) - margin.left - margin.right;
        const height = (chartData.height || 300) - margin.top - margin.bottom;
        const defaultColor = d3.scaleOrdinal().range(["red", "yellow", "green"]);

        // add svg element and a group
        const svg = d3.select("#" + elementId).append('svg')
            .attr('height', (chartData.heigth || 300))
            .attr('width', (chartData.width || 300));
        const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // add y-axis
        const y = d3.scaleBand()
            .rangeRound([0, height])
            .padding(0.1)
            .align(0.1);

        // add x-axis
        const x = d3.scaleLinear()
            .rangeRound([0, width]);

        const color = defaultColor;

        const stack = d3.stack()
            .offset(d3.stackOffsetExpand);

        // TODO: prepare given data, this is just an example
        const columns = ['label', 'hoch', 'mittel', 'niedrig'];
        const data = [
            { label: 'Allgemein', hoch: 15, mittel: 65, niedrig: 20, total: 100 },
            { label: 'Beobachten', hoch: 25, mittel: 45, niedrig: 30, total: 100 },
            { label: 'Verantwortlich', hoch: 15, mittel: 30, niedrig: 55, total: 100 }
        ];

        // add labels to y-axis
        y.domain(data.map((d) => {
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
            .attr("y", (d) => {
                return y(d.data.label);
            })
            .attr("x", (d) => {
                return x(d[0]);
            })
            .attr("width", (d) => {
                return x(d[1]) - x(d[0]);
            })
            .attr("height", y.bandwidth());

        // add rect labels
        serie.selectAll('text')
            .data((d) => {
                return d;
            })
            .enter().append('text')
            .attr("y", (d) => {
                return y(d.data.label) + y.bandwidth() / 2 + 10;
            })
            .attr("dx", (d) => {
                return x(d[0]) + (x(d[1]) - x(d[0])) / 2 - 10;
            })
            .attr("fill", "#fff")
            .style("font", "10px sans-serif")
            .text((d) => {
                // TODO: use real value
                return '00%';
            });

        // define position of y-axis
        g.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate(0,0)")
            .call(d3.axisLeft(y));

        // define position of x-axis
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(10, "%"));

        // TODO: style "legend" like in the mockups
        // add "legend" for columns (position)
        const legend = serie.append("g")
            .attr("class", "legend")
            .attr("transform", (d) => {
                d = d[d.length - 1];
                return "translate(" + (y(d.data.label) + y.bandwidth() - 30) + "," + ((x(d[0]) + x(d[1])) / 2) + ")";
            });
        // add a line and the text for "legend"
        legend.append("line")
            .attr("y1", -6)
            .attr("y2", 6)
            .attr("stroke", "#000");
        legend.append("text")
            .attr("y", 9)
            .attr("dx", "0.35em")
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

const StackedBarChartHorizontal = new StackedBarChartHorizontalWithD3();

export {
    StackedBarChartHorizontal
};
