import { ComponentState } from './ComponentState';

declare var Chart: any;

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentState): void {
        this.state.config = input.config;
        if (this.state.config) {
            setTimeout(() => {
                const ctx = (document.getElementById(this.state.chartId) as any).getContext('2d');
                if (ctx) {
                    const chart = new Chart(ctx, this.state.config);
                }
            }, 100);
        }
    }

}

module.exports = Component;
