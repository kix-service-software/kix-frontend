import { IChart } from './IChart';
declare var d3;

export class BarChartWithD3 implements IChart {

    public createChart(element: string, data: any): void {

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = (data.width || 300) - margin.left - margin.right;
        const height = (data.height || 300) - margin.top - margin.bottom;
        const radius = width / 2;
        const color = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "red", "blue"]);

        // set the ranges
        const x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
        const y = d3.scaleLinear()
            .range([height, 0]);

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        const svg = d3.select('#' + element).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        // // format the data
        // for (const dataEl in data.data) {
        //     dataEl.value = +dataEl.value;
        // });

        // Scale the range of the data in the domains
        x.domain(data.data.map((d) => {
            return d.label;
        }));
        y.domain([0, d3.max(data.data, (d) => {
            return d.value;
        }
        )]);

        // append the rectangles for the bar chart
        svg.selectAll(".bar")
            .data(data.data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d) => {
                return x(d.label);
            })
            .attr("width", x.bandwidth())
            .attr("y", (d) => {
                return y(d.value);
            })
            .attr("height", (d) => {
                return height - y(d.value);
            })
            .style('fill', (d) => {
                return color(data.data.indexOf(d));
            });

        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y));
    }
}

const BarChart = new BarChartWithD3();

export {
    BarChart
};
