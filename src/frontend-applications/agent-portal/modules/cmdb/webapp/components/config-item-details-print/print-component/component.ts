/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';

class Component {

    public state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (Array.isArray(input.properties)) {
            input.properties = input.properties.sort((a, b) => a[0].localeCompare(b[0]));
            const count = Math.round(input.properties.length / 2);
            this.state.leftProperties = input.properties.slice(0, count);
            this.state.rightProperties = input.properties.slice(count, input.properties.length);
        }
    }

    public async onMount(): Promise<void> {
        this.state.prepared = true;
    }

}

module.exports = Component;
