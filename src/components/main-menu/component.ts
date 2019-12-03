/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context, ContextType, MenuEntry, ContextDescriptor } from '../../core/model';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../core/browser/context/ContextService';
import { MainMenuSocketClient } from './MainMenuSocketClient';
import { ContextFactory } from '../../core/browser/context/ContextFactory';

class KIXMenuComponent {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'main-menu-listener',
            contextChanged: (contextId: string, newContext: Context, type: ContextType) => {
                if (type === ContextType.MAIN) {
                    this.setActiveMenuEntry(newContext);
                }
            },
            contextRegistered: (descriptor: ContextDescriptor) => {
                this.updateEntries(this.state.primaryMenuEntries, this.state.secondaryMenuEntries);
            }
        });

        await this.loadEntries();
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.setActiveMenuEntry(context);
        this.state.loading = false;
    }

    public onDestroy(): void {
        ContextService.getInstance().unregisterListener('main-menu-listener');
    }

    private async loadEntries(): Promise<void> {
        const entries = await MainMenuSocketClient.getInstance().loadMenuEntries();
        if (entries) {
            await this.updateEntries(entries.primaryMenuEntries, entries.secondaryMenuEntries);


            this.state.showText = entries.showText;
        }
    }

    private async updateEntries(primaryEntries: MenuEntry[], secondaryEntries: MenuEntry[]): Promise<void> {
        await this.setShownEntries(primaryEntries);
        await this.setShownEntries(secondaryEntries);

        this.state.primaryMenuEntries = [...primaryEntries];
        this.state.secondaryMenuEntries = [...secondaryEntries];
    }

    private async setShownEntries(entries: MenuEntry[]): Promise<void> {
        for (const entry of entries) {
            const descriptor = ContextFactory.getInstance().getContextDescriptor(entry.mainContextId);
            if (descriptor) {
                entry.show = true;
            }
        }
    }

    private setActiveMenuEntry(context: Context): void {
        if (context && context.getDescriptor()) {
            this.state.primaryMenuEntries.forEach(
                (me) => me.active = me.contextIds.some((id) => id === context.getDescriptor().contextId)
            );

            this.state.secondaryMenuEntries.forEach(
                (me) => me.active = me.contextIds.some((id) => id === context.getDescriptor().contextId)
            );

            (this as any).setStateDirty('primaryMenuEntries');
        }
    }

}

module.exports = KIXMenuComponent;
