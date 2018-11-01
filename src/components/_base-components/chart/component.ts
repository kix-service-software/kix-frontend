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
    private resizeTimeout: any = null;

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

            this.state.loading = true;
            this.onDestroy();

            this.setDrawTimeout();
        }
    }

    private setDrawTimeout(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            clearTimeout(this.drawTimeout);
        }
        this.timeout = setTimeout(() => {
            this.state.loading = false;
            this.drawTimeout = setTimeout(() => {
                const canvasElement = (this as any).getEl(this.state.chartId);
                if (canvasElement) {
                    const ctx = canvasElement.getContext('2d');
                    if (ctx) {
                        this.chart = new Chart(ctx, this.config);
                    }
                    if (canvasElement.width <= 300) {
                        canvasElement.width = 10;
                    }

                    canvasElement.style.width = '100%';
                    canvasElement.style.height = '100%';

                    if (screen.width < 1500) {
                        setTimeout(() => {
                            canvasElement.removeAttribute('height');
                            canvasElement.removeAttribute('width');

                            canvasElement.style.width = '100%';
                            canvasElement.style.height = '100%';
                        }, 500);
                    }
                }
                this.drawTimeout = null;
            }, 500);
            this.timeout = null;
        }, 1500);
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

        window.addEventListener("resize", this.windowResizeThrottler.bind(this), false);
    }

    private windowResizeThrottler() {
        if (!this.resizeTimeout) {
            this.resizeTimeout = setTimeout(() => {
                this.resizeTimeout = null;

                this.state.loading = true;
                this.onDestroy();

                this.setDrawTimeout();
            }, 66);
        }
    }

    public onDestroy(): void {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        window.removeEventListener("resize", this.windowResizeThrottler.bind(this), false);
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
                if (canvasElement.width <= 300) {
                    canvasElement.width = 10;
                }
                canvasElement.style.width = '100%';
                canvasElement.style.height = '100%';
            }
            this.timeout = null;
        }, 100);
    }
}

module.exports = Component;
