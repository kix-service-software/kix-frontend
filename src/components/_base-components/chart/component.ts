/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ChartConfiguration } from 'chart.js';
import { ContextService } from '../../../core/browser';

declare var Chart: any;

class Component {

    private state: ComponentState;

    public config: ChartConfiguration = null;
    private chart: Chart;
    private updateTimeout;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (!this.config) {
            this.setConfig(input.config);
        }
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        this.updateTimeout = setTimeout(() => {
            this.setConfig(input.config);
            if (this.chart) {
                this.chart.update();
            }
            this.updateTimeout = null;
        }, 600);
    }

    private setConfig(config: ChartConfiguration): void {
        if (config) {
            if (!this.config) {
                this.config = {};
            }
            if (!this.config.data) {
                this.config.data = {};
            }
            this.config.data.datasets = config.data ? [...config.data.datasets] : [];
            this.config.data.labels = config.data ? [...config.data.labels] : [];
            this.config.options = config.options;
            this.config.plugins = config.plugins;
            this.config.type = config.type;
        } else {
            this.config = null;
        }
        if (this.config) {
            if (!this.config.options) {
                this.config.options = { animation: { duration: 600 } };
            } else if (!this.config.options.animation) {
                this.config.options.animation = { duration: 600 };
            }
            this.config.options.responsive = true;
            this.config.options.maintainAspectRatio = false;
            if (this.chart) {
                this.chart['options'] = this.config.options;
            }
        }
    }

    public onMount(): void {
        const context = ContextService.getInstance().getActiveContext();
        context.registerListener(this.state.chartId, {
            sidebarToggled: () => {
                setTimeout(() => {
                    if (
                        (!context.isExplorerBarShown() && window.innerWidth > 1475) ||
                        (context.isExplorerBarShown() && window.innerWidth > 1700)
                    ) {
                        this.createChart();
                    }
                }, 10);
            },
            explorerBarToggled: () => { setTimeout(() => { this.createChart(); }, 10); },
            objectChanged: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: () => { return; }
        });

        window.addEventListener('resize', this.createChart.bind(this), false);
        window.addEventListener('beforeprint', this.beforePrint.bind(this));

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
                    try {
                        this.chart.destroy();
                    } catch (e) {
                        //
                    }
                }
                this.chart = new Chart(ctx, this.config);
            }
        }
    }

    public onDestroy(): void {
        if (this.chart) {
            try {
                this.chart.destroy();
                this.chart = null;
            } catch (e) {
                //
            }
        }
        window.removeEventListener('resize', this.createChart.bind(this), false);
        window.removeEventListener('beforeprint', this.beforePrint.bind(this));
    }

}

module.exports = Component;
