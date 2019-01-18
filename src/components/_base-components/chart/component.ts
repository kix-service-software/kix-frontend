import { ComponentState } from './ComponentState';
import { ChartConfiguration } from 'chart.js';
import { ContextService } from '../../../core/browser';

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
            if (!this.config.options) {
                this.config.options = { animation: { duration: 600 } };
            } else if (!this.config.options.animation) {
                this.config.options.animation = { duration: 600 };
            }
            this.config.options.responsive = true;
            this.config.options.maintainAspectRatio = false;
        }

        if (this.chart) {
            this.chart.update();
        }
    }

    public onUpdate(): void {
        this.createChart();
    }

    public onMount(): void {
        const context = ContextService.getInstance().getActiveContext();
        context.registerListener(this.state.chartId, {
            sidebarToggled: () => { setTimeout(() => { this.createChart(); }, 10); },
            explorerBarToggled: () => { setTimeout(() => { this.createChart(); }, 10); },
            objectChanged: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        window.addEventListener("resize", this.createChart.bind(this), false);
        window.addEventListener("beforeprint", this.beforePrint.bind(this));

        this.createChart();
    }

    private beforePrint(): void {
        if (this.chart) {
            this.chart.resize();
        }
    }

    private createChart() {
        const canvasElement = (this as any).getEl(this.state.chartId);
        if (canvasElement) {
            const ctx = canvasElement.getContext('2d');
            if (ctx) {
                if (this.chart) {
                    this.chart.destroy();
                }
                this.chart = new Chart(ctx, this.config);

                if (window.screen.width < 1440) {
                    setTimeout(() => {
                        canvasElement.removeAttribute('height');
                        canvasElement.removeAttribute('width');

                        canvasElement.style.width = '100%';
                        canvasElement.style.height = '100%';
                    }, 100);
                }
            }
        }
    }

    public onDestroy(): void {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        window.removeEventListener("resize", this.createChart.bind(this), false);
        window.removeEventListener("beforeprint", this.beforePrint.bind(this));
    }

}

module.exports = Component;
