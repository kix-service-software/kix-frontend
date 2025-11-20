/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXStyle } from '../../../../../base-components/model/KIXStyle';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public state: ComponentState;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        window.addEventListener('resize', this.resizeHandling.bind(this), false);
        this.resizeHandling();
    }

    public onDestroy(): void {
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
    }

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= KIXStyle.MOBILE_BREAKPOINT);
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
