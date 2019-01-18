import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../core/browser';
import { DateTimeUtil } from '../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    private interval: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.time = input.time;
    }

    public async onMount(): Promise<void> {
        if (this.state.time) {
            this.interval = setInterval(() => {
                this.state.time = this.state.time - 1000;
                this.state.timeText = DateTimeUtil.getTimeByMillisec(this.state.time);
            }, 1000);
        }
    }

    public async onDestroy(): Promise<void> {
        clearInterval(this.interval);
    }
}

module.exports = Component;
