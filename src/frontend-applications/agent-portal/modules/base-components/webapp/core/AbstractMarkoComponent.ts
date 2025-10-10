/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from './AbstractComponentState';
import { Context } from '../../../../model/Context';
import { ContextService } from './ContextService';
import { ObjectFormConfigurationContext } from '../../../object-forms/webapp/core/ObjectFormConfigurationContext';

// eslint-disable-next-line max-len
export abstract class AbstractMarkoComponent<CS extends AbstractComponentState = AbstractComponentState, C extends Context = Context> {

    private readonly id: string;
    public state: CS;
    protected context: C;
    protected contextInstanceId: string;

    public onCreate(input: any): void {
        return;
    }

    public onInput(input: any): void {
        this.contextInstanceId = input.contextInstanceId;
    }

    public async onMount(contextInstanceId?: string): Promise<void> {
        if (contextInstanceId) {
            this.context = ContextService.getInstance().getContext(contextInstanceId) as C;
        } else if (this.id) {
            const componentContextInstanceId = ContextService.getInstance().getComponentContextInstanceId(this.id);
            this.context = ContextService.getInstance().getContext(componentContextInstanceId) as C;
        }

        if (!this.context) {
            this.context = ContextService.getInstance().getActiveContext<C>();
        }

        if (this.context && this.id) {
            ContextService.getInstance().setComponentContextInstanceId(
                this.id, this.context.instanceId
            );
        }

        this.state.isConfigContext = this.context?.contextId === ObjectFormConfigurationContext.CONTEXT_ID;
    }

    public onUpdate(): void {
        return;
    }

    public onDestroy(): void {
        return;
    }

}
