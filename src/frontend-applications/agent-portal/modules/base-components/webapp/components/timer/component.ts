/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';

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
                if (this.state.time <= 0) {
                    this.state.time = 0;
                }
                this.state.timeText = DateTimeUtil.getTimeByMillisec(this.state.time);

            }, 1000);
        }
    }

    public async onDestroy(): Promise<void> {
        clearInterval(this.interval);
    }
}

module.exports = Component;
