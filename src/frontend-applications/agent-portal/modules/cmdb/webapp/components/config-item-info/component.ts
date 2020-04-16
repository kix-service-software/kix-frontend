/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ConfigItemLabelProvider } from '../../core';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.configItem = input.configItem;
    }

    public async onMount(): Promise<void> {
        this.state.loading = false;
    }

    public getVersionTemplate(): any {
        return KIXModulesService.getComponentTemplate('config-item-version-details');
    }

}

module.exports = Component;
