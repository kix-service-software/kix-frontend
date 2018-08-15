import { ComponentState } from './ComponentState';
import { ChartConfiguration } from 'chart.js';

declare var Chart: any;

class Component {

    private state: ComponentState;

    public config: ChartConfiguration = null;
    private chart: Chart;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.config = input.config;
        if (this.config) {
            setTimeout(() => {
                const ctx = (document.getElementById(this.state.chartId) as any).getContext('2d');
                if (ctx) {
                    if (this.chart) {
                        this.chart.data.labels = this.config.data.labels;
                        this.chart.data.datasets = this.config.data.datasets;

                        this.chart.update();
                    } else {
                        this.chart = new Chart(ctx, this.config);
                    }
                }
            }, 100);
        }
    }

}

module.exports = Component;
