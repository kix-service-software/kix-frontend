import { IChart } from './IChart';

declare const d3;

export class StackedBarChartWithD3 implements IChart {

    // TODO: not functionable
    public createChart(elementId: string, chartData: any): void {

        const margin = { top: 50, right: 20, bottom: 10, left: 65 };
        const width = (chartData.width || 300) - margin.left - margin.right;
        const height = (chartData.height || 300) - margin.top - margin.bottom;
        const defaultColor = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "red", "blue"]);

        const data = this.prepareData(chartData.data);

        const y = d3.scale.ordinal()
            .rangeRoundBands([0, height], .3);

        const x = d3.scale.linear()
            .rangeRound([0, width]);

        const xAxis = d3.svg.axis()
            .scale(x)
            .orient("top");

        const yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        const svg = d3.select("#" + elementId).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        defaultColor.domain(["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"]);

        chartData.data.forEach((d) => {
            // calc percentages
            d["Strongly disagree"] = +d[1] * 100 / d.N;
            d["Disagree"] = +d[2] * 100 / d.N;
            d["Neither agree nor disagree"] = +d[3] * 100 / d.N;
            d["Agree"] = +d[4] * 100 / d.N;
            d["Strongly agree"] = +d[5] * 100 / d.N;
            let x0 = -1 * (d["Neither agree nor disagree"] / 2 + d["Disagree"] + d["Strongly disagree"]);
            let idx = 0;
            d.boxes = defaultColor.domain().map((name) => {
                return { name, x0, x1: x0 += +d[name], N: +d.N, n: +d[idx += 1] };
            });
        });

        const min_val = d3.min(chartData.data, (d) => {
            return d.boxes["0"].x0;
        });

        const max_val = d3.max(chartData.data, (d) => {
            return d.boxes["4"].x1;
        });

        x.domain([min_val, max_val]).nice();
        y.domain(chartData.data.map((d) => {
            return d.Question;
        }));

        svg.append("g")
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        const vakken = svg.selectAll(".question")
            .data(chartData.data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", (d) => {
                return "translate(0," + y(d.Question) + ")";
            });

        const bars = vakken.selectAll("rect")
            .data((d) => {
                return d.boxes;
            })
            .enter().append("g").attr("class", "subbar");

        bars.append("rect")
            .attr("height", y.rangeBand())
            .attr("x", (d) => {
                return x(d.x0);
            })
            .attr("width", (d) => {
                return x(d.x1) - x(d.x0);
            })
            .style("fill", (d) => {
                return defaultColor(d.name);
            });

        bars.append("text")
            .attr("x", (d) => {
                return x(d.x0);
            })
            .attr("y", y.rangeBand() / 2)
            .attr("dy", "0.5em")
            .attr("dx", "0.5em")
            .style("font", "10px sans-serif")
            .style("text-anchor", "begin")
            .text((d) => {
                return d.n !== 0 && (d.x1 - d.x0) > 3 ? d.n : "";
            });

        vakken.insert("rect", ":first-child")
            .attr("height", y.rangeBand())
            .attr("x", "1")
            .attr("width", width)
            .attr("fill-opacity", "0.5")
            .style("fill", "#F5F5F5")
            .attr("class", (d, i) => {
                return i % 2 === 0 ? "even" : "uneven";
            });

        svg.append("g")
            .attr("class", "y axis")
            .append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y2", height);

        const startp = svg.append("g").attr("class", "legendbox").attr("id", "mylegendbox");
        // this is not nice, we should calculate the bounding box and use that
        const legend_tabs = [0, 120, 200, 375, 450];
        const legend = startp.selectAll(".legend")
            .data(defaultColor.domain().slice())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => {
                return "translate(" + legend_tabs[i] + ",-45)";
            });

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", defaultColor);

        legend.append("text")
            .attr("x", 22)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "begin")
            .style("font", "10px sans-serif")
            .text((d) => {
                return d;
            });

        d3.selectAll(".axis path")
            .style("fill", "none")
            .style("stroke", "#000")
            .style("shape-rendering", "crispEdges");

        d3.selectAll(".axis line")
            .style("fill", "none")
            .style("stroke", "#000")
            .style("shape-rendering", "crispEdges");

        const movesize = width / 2 - startp.node().getBBox().width / 2;
        d3.selectAll(".legendbox").attr("transform", "translate(" + movesize + ",0)");

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
