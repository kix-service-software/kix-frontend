/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { Cell } from '../../../../table/model/Cell';
import { CheckListItem } from '../../../model/CheckListItem';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell: Cell = input.cell;
        if (cell) {
            this.update(cell);
        }
    }

    private async update(cell: Cell): Promise<void> {
        const checklistItem = cell.getRow().getRowObject<CheckListItem>().getObject();
        this.state.checklistItem = checklistItem;
    }

}

module.exports = Component;
