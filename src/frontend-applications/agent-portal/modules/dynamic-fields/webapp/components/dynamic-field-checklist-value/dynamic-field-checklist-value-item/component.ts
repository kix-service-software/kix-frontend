/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { CheckListItem } from '../../../../model/CheckListItem';
import { DynamicFieldFormUtil } from '../../../../../base-components/webapp/core/DynamicFieldFormUtil';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';

export class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.item = input.item;
        return;
    }

    public toggleExpanded(): void {
        this.state.expanded = !this.state.expanded;
    }

    public getStateIcon(item: CheckListItem): string {
        const states = item.checklistStates || DynamicFieldFormUtil.getDefaultChecklistStates();
        const state = states?.find((s) => s.label === item.value);
        return state?.icon;
    }

}

module.exports = Component;