import { PieChart } from './../../../model/client/charts/PieChart';
declare var d3: any;

class ChartContainerComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            id: 'default'
        };
    }

    public onInput(input: any): void {
        this.state = {};
        if (input && input.chartData) {
            this.state.id = input.chartId || this.state.id;
            if (input.type === 'pie') {
                PieChart.createChart(this.state.id, input.chartData);
                // this.draw();
            }
        }
    }

    private draw() {
        const width = 300;
        const height = 300;
        const radius = width / 2;
        const color = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "red", "blue"]);

        const values = [15, 35, 5, 65];
        const labels = ['Bla', 'Blub', 'Boing', 'Test'];

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

        const id = this.state.id;
        const svg = d3.select(this.state.id)
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
    }
}

module.exports = ChartContainerComponent;
