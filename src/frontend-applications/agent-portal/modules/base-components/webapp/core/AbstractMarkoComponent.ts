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

// eslint-disable-next-line max-len
export abstract class AbstractMarkoComponent<CS extends AbstractComponentState = AbstractComponentState, C extends Context = Context> {

    public state: CS;
    protected context: C;

    public onCreate(input: any): void {
        return;
    }

    public onInput(input: any): void {
        return;
    }

    public async onMount(contextInstanceId?: string): Promise<void> {
        if (contextInstanceId) {
            this.context = ContextService.getInstance().getContext(contextInstanceId) as C;
            return;
        }

        let markoId: string;
        if ('id' in this && typeof this.id === 'string') {
            markoId = this.id;
        }

        if (markoId) {
            const componentContextInstanceId = ContextService.getInstance().getComponentContextInstanceId(markoId);
            this.context = ContextService.getInstance().getContext(componentContextInstanceId) as C;
        }

        if (!this.context) {
            this.context = ContextService.getInstance().getActiveContext<C>();
        }

        if (this.context && markoId) {
            ContextService.getInstance().setComponentContextInstanceId(
                markoId, this.context.instanceId
            );
        }
    }

    public onUpdate(): void {
        return;
    }

    public onDestroy(): void {
        return;
    }

}
