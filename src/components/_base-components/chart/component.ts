import { ComponentState } from './ComponentState';
import { ChartConfiguration } from 'chart.js';
import { ContextService } from '@kix/core/dist/browser';

declare var Chart: any;

class Component {

    private state: ComponentState;

    public config: ChartConfiguration = null;
    private chart: Chart;
    private timeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.config = input.config;
        if (this.config) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                const canvasElement = (this as any).getEl(this.state.chartId);
                if (canvasElement) {
                    const ctx = canvasElement.getContext('2d');
                    if (ctx) {
                        if (this.chart) {
                            this.chart.data.labels = this.config.data.labels;
                            this.chart.data.datasets = this.config.data.datasets;

                            this.chart.update();
                        } else {
                            this.chart = new Chart(ctx, this.config);
                        }
                    }
                }
                this.timeout = null;
            }, 100);
        }
    }

    public onMount(): void {
        const context = ContextService.getInstance().getActiveContext();
        context.registerListener(this.state.chartId, {
            sidebarToggled: () => { this.rebuildChart(); },
            explorerBarToggled: () => { this.rebuildChart(); },
            objectChanged: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }

        });
    }

    private rebuildChart(): void {
        if (this.chart) {
            this.chart.destroy();
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            const canvasElement = (this as any).getEl(this.state.chartId);
            if (canvasElement) {
                const ctx = canvasElement.getContext('2d');
                if (ctx) {
                    this.chart = new Chart(ctx, this.config);
                }
            }
            this.timeout = null;
        }, 100);
    }
}

module.exports = Component;
