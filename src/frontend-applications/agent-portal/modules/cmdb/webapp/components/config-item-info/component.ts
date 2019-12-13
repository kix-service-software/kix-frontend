/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ConfigItemLabelProvider } from '../../core';

class Component {

    private state: ComponentState;

    public labelProvider: ConfigItemLabelProvider;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.configItem = input.configItem;
    }

    public async onMount(): Promise<void> {
        this.labelProvider = new ConfigItemLabelProvider();
        const icons = await this.labelProvider.getIcons(this.state.configItem, "CurInciStateID");
        this.state.icon = icons && icons.length ? icons[0] : null;
        this.state.loading = false;
    }

}

module.exports = Component;
