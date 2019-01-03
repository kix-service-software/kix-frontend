import { ChartDataRow } from './data/ChartDataRow';
import { IChart } from './IChart';

declare var d3;

export class D3PieChart implements IChart {

    public createChart(domId: string, chartData: ChartDataRow[]): void {

        // get svg
        const svg = d3.select('#' + domId);
        const width = +svg.attr("width") || 400;
        const height = +svg.attr("height") || 150;
        const radius = height / 2;
        const defaultColor =
            d3.scaleOrdinal().range(["#a52f86", "#6d86cc", "#fbc80c", "#fb990c", "#fb2e0c", "#c0fb0c"]);
        const data = [];

        // get overall number
        let overall = 0;
        chartData.forEach((dataEl) => {
            overall += +dataEl.rowValue[0].value;
        });

        // prepare data
        chartData.forEach((dataEl) => {
            const value = 100 * +dataEl.rowValue[0].value / overall;
            data.push({
                label: dataEl.label + ' | ' + value.toFixed(2) + '%',
                value
            });
        });

        // define arc of pie (position, size)
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius - 10);

        // define label arc of pie
        const labelArc = d3.arc()
            .innerRadius(radius - 40)
            .outerRadius(radius - 40);

        // create pie with values
        const pie = d3.pie()
            .sort(null)
            .value((d) => {
                return d.value;
            });

        // add one group in the middle to svg
        const group = svg.append("g")
            .attr("transform", "translate(" + radius + "," + radius + ")");

        // add groups for each data element, eventual arcs
        const arcs = group.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        // add arc to arc-groups
        arcs.append("path")
            .attr("d", arc)
            .style("fill", (d, i) => {
                return defaultColor(i);
            });

        // TODO: ggf. doch noch notwendig,
        // wenn Werte wirklich zusätzlich noch auf den Kreisstücken stehne sollen
        // // add label to arc-groups
        // arcs.append("text")
        //     .attr("transform", (d) => {
        //         return "translate(" + labelArc.centroid(d) + ")";
        //     })
        //     .attr("dy", ".35em")
        //     .text((d) => {
        //         return d.data.label;
        //     });

        // define legend
        const legendRectSize = 18;
        const legendSpacing = 4;
        const legend = svg.append("g")
            .attr("transform", "translate(" + (2 * radius + 20) + "," + radius + ")");
        const legendRows = legend.selectAll('.legend')
            .data(data)
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => {
                const legentRowHeight = legendRectSize + legendSpacing;
                const legentRowOffset = legentRowHeight * data.length / 2;
                const legendRowHorizontal = 0; // -2 * legendRectSize;
                const legendRowVertical = i * legentRowHeight - legentRowOffset;
                return 'translate(' + legendRowHorizontal + ',' + legendRowVertical + ')';
            });
        // add legend color rects
        legendRows.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', (d, i) => {
                return defaultColor(i);
            })
            .style('stroke', (d, i) => {
                return defaultColor(i);
            });
        // add legend labels
        legendRows.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text((d) => {
                return d.label;
            });
    }
}

const PieChart = new D3PieChart();

export {
    PieChart
};
