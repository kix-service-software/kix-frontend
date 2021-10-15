/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent
} from '../../../../../../core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public showIcons: boolean = true;
    public showText: boolean = true;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.cell = input.cell;
        this.update();
    }

    private update(): void {
        if (this.state.cell) {
            const config = this.state.cell.getColumnConfiguration();
            if (config) {
                this.showIcons = config.showIcon;
                this.showText = config.showText;
            }
            (this as any).setStateDirty();
        }
    }

    public onDestroy(): void {
        // nothing
    }
}

module.exports = Component;
