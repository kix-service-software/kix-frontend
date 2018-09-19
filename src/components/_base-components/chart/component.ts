import { ComponentState } from './ComponentState';
import { ChartConfiguration } from 'chart.js';
import { ContextService } from '@kix/core/dist/browser';

declare var Chart: any;

class Component {

    private state: ComponentState;

    public config: ChartConfiguration = null;
    private chart: Chart;
    private timeout: any;
    private drawTimeout: any;

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

            if (this.timeout) {
                clearTimeout(this.timeout);
                clearTimeout(this.drawTimeout);
            }

            this.state.loading = true;
            this.onDestroy();
            this.timeout = setTimeout(() => {
                this.state.loading = false;
                this.drawTimeout = setTimeout(() => {
                    const canvasElement = (this as any).getEl(this.state.chartId);
                    if (canvasElement) {
                        const ctx = canvasElement.getContext('2d');
                        if (ctx) {
                            this.chart = new Chart(ctx, this.config);
                        }
                    }
                    this.drawTimeout = null;
                }, 500);
                this.timeout = null;
            }, 1500);
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

    public onDestroy(): void {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
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
