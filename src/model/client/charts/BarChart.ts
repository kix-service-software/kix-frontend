import { IChart } from './IChart';

declare var d3;

export class BarChartWithD3 implements IChart {

    public createChart(elementId: string, chartData: any): void {

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = (chartData.width || 300) - margin.left - margin.right;
        const height = (chartData.height || 300) - margin.top - margin.bottom;
        const defaultColor = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "red", "blue"]);

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        const svg = d3.select('#' + elementId).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .append("g")
            .attr("transform", "translate(0,0)");

        // format the data
        for (const dataEl of chartData.data) {
            dataEl.value = +dataEl.value;
        }

        // set the ranges/ define the axis
        const xAxis = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
        const yAxis = d3.scaleLinear()
            .range([height, 0]);

        // scale the range of the data in the domains
        xAxis.domain(chartData.data.map((d) => {
            return d.label;
        }));
        yAxis.domain([
            0, d3.max(chartData.data, (d) => {
                return d.value;
            })
        ]);

        // append the rectangles for the bar chart
        svg.selectAll(".bar")
            .data(chartData.data)
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
                return defaultColor(chartData.data.indexOf(d));
            });

        // add the x axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xAxis));

        // add the y axis
        svg.append("g")
            .call(d3.axisLeft(yAxis));
    }
}

const BarChart = new BarChartWithD3();

export {
    BarChart
};
