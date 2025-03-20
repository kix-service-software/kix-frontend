/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.cell = input.cell;
        if (this.state.cell) {
            const value = this.state.cell.getValue().objectValue;
            this.state.isActive = !isNaN(value);
        }
    }

    public goToClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            context.provideScrollInformation(KIXObjectType.CONFIG_ITEM_VERSION, this.state.cell.getValue().objectValue);
        }
    }

}

module.exports = Component;
