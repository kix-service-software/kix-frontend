import { IChart } from './IChart';

declare const d3;

export class StackedBarChartWithD3 implements IChart {


    public createChart(elementId: string, chartData: any): void {
        this.createChart2(elementId, chartData);
    }

    public createChart1(elementId: string, chartData: any): void {
        const data = [
            { month: 'Jan', A: 20, B: 5, C: 10 },
            { month: 'Feb', A: 30, B: 10, C: 20 }
        ];

        const xData = ["A", "B", "C"];

        const margin = { top: 20, right: 50, bottom: 30, left: 50 };
        const width = 400 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const x = d3.scaleBand()
            .rangeRound([0, width]);

        const y = d3.scaleLinear()
            .rangeRound([height, 0]);

        const defaultColor = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "red", "blue"]);

        const svg = d3.select('#' + elementId).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const dataIntermediate = xData.map((c) => {
            return data.map((d) => {
                return { x: d.month, y: d[c] };
            });
        });
        const dataStackLayout = [
            [
                { x: 'Jan', y0: 0, y: 20 },
                { x: 'Feb', y0: 0, y: 25 }
            ],
            [
                { x: 'Jan', y0: 20, y: 5 },
                { x: 'Feb', y0: 25, y: 10 }
            ]
            ,
            [
                { x: 'Jan', y0: 25, y: 10 },
                { x: 'Feb', y0: 35, y: 20 }
            ]
        ];
        // const dataStackLayout = d3.layout.stack()(dataIntermediate);

        x.domain(dataStackLayout[0].map((d) => {
            return d.x;
        }));

        y.domain([0, d3.max(dataStackLayout[dataStackLayout.length - 1], (d) => {
            return d.y0 + d.y;
        })])
            .nice();

        const layer = svg.selectAll(".stack")
            .data(dataStackLayout)
            .enter().append("g")
            .attr("class", "stack")
            .style("fill", (d, i) => {
                return defaultColor(i);
            });

        layer.selectAll("rect")
            .data((d) => {
                return d;
            })
            .enter().append("rect")
            .attr("x", (d) => {
                return x(d.x);
            })
            .attr("y", (d) => {
                return y(d.y + d.y0);
            })
            .attr("height", (d) => {
                return y(d.y0) - y(d.y + d.y0);
            })
            .attr("width", x.bandwidth());

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
    }

    // TODO: not functionable
    public createChart2(elementId: string, chartData: any): void {

        const margin = { top: 20, right: 60, bottom: 30, left: 40 };
        const width = (chartData.width || 300) - margin.left - margin.right;
        const height = (chartData.height || 300) - margin.top - margin.bottom;
        const defaultColor = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "red", "blue"]);

        const svg = d3.select("#" + elementId).append('svg')
            .attr('height', (chartData.heigth || 300))
            .attr('width', (chartData.width || 300));
        const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1)
            .align(0.1);

        const y = d3.scaleLinear()
            .rangeRound([height, 0]);

        const color = defaultColor;

        const stack = d3.stack()
            .offset(d3.stackOffsetExpand);

        const columns = ['label', 'hoch', 'mittel', 'gering'];
        const data = [
            { label: 'Allgemein', hoch: 15, mittel: 65, niedrig: 20, total: 100 },
            { label: 'Beobachten', hoch: 25, mittel: 45, niedrig: 30, total: 100 },
            { label: 'Verantwortlich', hoch: 15, mittel: 30, niedrig: 55, total: 40 }
        ];
        data.sort((a, b) => {
            return b[columns[1]] / b.total - a[columns[1]] / a.total;
        });

        x.domain(data.map((d) => {
            return d.label;
        }));
        color.domain(columns.slice(1));

        const serie = g.selectAll(".serie")
            .data(stack.keys(columns.slice(1))(data))
            .enter().append("g")
            .attr("class", "serie")
            .attr("fill", (d) => {
                return color(d.key);
            });

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

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10, "%"));

        const legend = serie.append("g")
            .attr("class", "legend")
            .attr("transform", (d) => {
                d = d[d.length - 1];
                return "translate(" + (x(d.data.State) + x.bandwidth()) + "," + ((y(d[0]) + y(d[1])) / 2) + ")";
            });

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
