/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { FormValueAction } from '../../../model/FormValues/FormValueAction';
import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';

export class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.actions = input.actions ?? [];
        this.state.isSelectInput = input.isSelectInput ?? false;
        this.initActions();
    }

    public async onMount(): Promise<void> {
        this.state.prepared = true;
    }

    private async initActions(): Promise<void> {
        const actions: FormValueAction[] = [];
        for (const action of this.state.actions) {
            const canShow = await action.canShow();
            if (canShow) {
                actions.push(action);
            }
        }

        this.state.actions = actions;
        this.sortActions();
        this.setActionsArrays(this.state.actions);
    }

    public actionClicked(action: AbstractAction, event: any): void {
        if (action.canRun()) {
            action.run(event);
            (this as any).setStateDirty('formValue');
        }
    }

    private sortActions(): void {
        this.state.actions = this.state.actions.reduce((arr, action) => {
            action.isActive() ? arr.unshift(action) : arr.push(action);
            return arr;
        }, []);
    }

    private resetActionArrays(): void {
        this.state.visibleActions = [];
        this.state.expandableActions = [];
    }

    private setActionsArrays(actions: FormValueAction[]): void {
        this.resetActionArrays();
        const counterLength = actions.length > 3 ? 3 : actions.length;
        for (let i = 0; i < counterLength; i++) {
            this.state.visibleActions.push(actions[i]);
        }
        if (actions.length > 3) {
            for (let i = 3; i < actions.length; i++) {
                this.state.expandableActions.push(actions[i]);
            }
        }
    }

}

module.exports = Component;