/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { ContextEvents } from '../../core/ContextEvents';
import { ContextService } from '../../core/ContextService';
import { KIXModulesService } from '../../core/KIXModulesService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private isLeft: boolean;
    private hasSidebars: boolean;

    public onCreate(input: any): void {
        super.onCreate(input, 'sidebar');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.isLeft = input.isLeft;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        super.registerEventSubscriber(
            async function (data: any, eventId: string): Promise<void> {
                if (eventId === ContextEvents.CONTEXT_REMOVED) {
                    const index = this.state.contextList.findIndex((c) => c.instanceId === data?.instanceId);
                    if (index !== -1) {
                        this.state.contextList.splice(index, 1);
                    }
                } else if (eventId === ContextEvents.CONTEXT_CHANGED) {
                    if (!this.state.contextList.some((c) => c.instanceId === data.instanceId)) {
                        this.state.contextList.push(data);
                    }
                } else if (eventId === ApplicationEvent.REFRESH_CONTENT) {
                    this.state.reloadSidebarId = data;

                    setTimeout(() => {
                        this.state.reloadSidebarId = null;
                    }, 25);
                }

                const activeContext = ContextService.getInstance().getActiveContext();

                const sidebars = this.isLeft
                    ? await activeContext?.getSidebarsLeft() || []
                    : await activeContext?.getSidebarsRight() || [];

                this.hasSidebars = sidebars?.length > 0;

                (this as any).setStateDirty('contextList');
            },
            [
                ApplicationEvent.REFRESH_CONTENT,
                ContextEvents.CONTEXT_CHANGED,
                ContextEvents.CONTEXT_REMOVED
            ]
        );
    }

    public sidebarToggled(showSidebarArea: boolean): void {
        this.state.showSidebarArea = showSidebarArea;
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public isActiveContext(instanceId: string): boolean {
        const activeContext = ContextService.getInstance().getActiveContext();
        return activeContext?.instanceId === instanceId && this.hasSidebars;
    }

    public getSidebarTemplate(): any {
        return KIXModulesService.getComponentTemplate('context-sidebar');
    }
}

module.exports = Component;