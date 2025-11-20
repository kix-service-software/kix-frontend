/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { MainMenuSocketClient } from './MainMenuSocketClient';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../../model/ContextType';
import { Context } from '../../../../../../model/Context';
import { ContextDescriptor } from '../../../../../../model/ContextDescriptor';
import { MenuEntry } from '../../../../../../model/MenuEntry';
import { MobileShowEvent } from '../../../../model/MobileShowEvent';
import { MobileShowEventData } from '../../../../model/MobileShowEventData';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { KIXStyle } from '../../../../../base-components/model/KIXStyle';

class Component extends AbstractMarkoComponent {

    public state: ComponentState;

    public onCreate(input: any): void {
        super.onCreate(input, 'main-menu');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'main-menu-listener',
            contextChanged: (contextId: string, newContext: Context, type: ContextType) => {
                if (type === ContextType.MAIN) {
                    this.setActiveMenuEntry(newContext);
                }
            },
            contextRegistered: (descriptor: ContextDescriptor) => {
                this.updateEntries(this.state.primaryMenuEntries, this.state.secondaryMenuEntries);
            },
            beforeDestroy: () => null
        });

        window.addEventListener('resize', this.resizeHandling.bind(this), false);
        this.resizeHandling();

        super.registerEventSubscriber(
            function (data: MobileShowEventData, eventId: MobileShowEvent | string): void {
                this.state.showMobile = data === MobileShowEventData.SHOW_MAIN_MENU;
            },
            [MobileShowEvent.SHOW_MOBILE]
        );

        await this.loadEntries();
        const context = ContextService.getInstance().getActiveContext();
        this.setActiveMenuEntry(context);
        this.state.loading = false;
    }

    public onDestroy(): void {
        super.onDestroy();
        ContextService.getInstance().unregisterListener('main-menu-listener');
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
    }

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= KIXStyle.MOBILE_BREAKPOINT);
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

        this.state.translations = await TranslationService.createTranslationObject([
            ...primaryEntries.map((e) => e.text),
            ...secondaryEntries.map((e) => e.text)
        ]);
    }

    private async setShownEntries(entries: MenuEntry[]): Promise<void> {
        entries.forEach((e) => e.show = ContextService.getInstance().hasContextDescriptor(e.mainContextId));
    }

    private setActiveMenuEntry(context: Context): void {
        if (context && context.descriptor) {
            this.state.primaryMenuEntries.forEach(
                (me) => me.active = me.contextIds.some((id) => id === context.contextId)
            );

            this.state.secondaryMenuEntries.forEach(
                (me) => me.active = me.contextIds.some((id) => id === context.contextId)
            );

            (this as any).setStateDirty('primaryMenuEntries');
        }
    }


    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
