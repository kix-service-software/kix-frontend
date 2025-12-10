/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../../model/IdService';
import { KIXModulesService } from '../../../core/KIXModulesService';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { MobileShowEvent } from '../../../../../agent-portal/model/MobileShowEvent';
import { MobileShowEventData } from '../../../../../agent-portal/model/MobileShowEventData';
import { KIXStyle } from '../../../../model/KIXStyle';
import { AbstractMarkoComponent } from '../../../core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, `sidebar/context-sidebar-${input.isLeft ? 'left' : 'right'}`);
        this.state = new ComponentState();
        this.state.isLeft = input.isLeft;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.prepareSidebars();

        this.state.translations = await TranslationService.createTranslationObject(
            ['Translatable#Close Sidebars', 'Translatable#Open Sidebars']
        );

        window.addEventListener('resize', this.resizeHandling.bind(this), false);
        this.resizeHandling();

        super.registerEventSubscriber(
            function (data, eventId: MobileShowEvent | string): void {
                this.state.showMobile =
                    (this.state.isLeft && data === MobileShowEventData.SHOW_LEFT_SIDEBAR)
                    || (!this.state.isLeft && data === MobileShowEventData.SHOW_RIGHT_SIDEBAR);
            },
            [MobileShowEvent.SHOW_MOBILE]
        );
    }

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= KIXStyle.MOBILE_BREAKPOINT);
        this.state.isSmall = this.state.isLeft
            ? Boolean(window.innerWidth <= 1300) : Boolean(window.innerWidth <= 1600);
        this.handleShowSidebarAreaState();
    }

    private handleShowSidebarAreaState(): void {
        if (this.state.isSmall) {
            if (this.state.showSidebarArea) {
                this.toggleSidebarArea();
            }
        } else if (this.context) {
            this.state.showSidebarArea = this.context.isSidebarOpen(this.state.isLeft);
            (this as any).emit('sidebarToggled', this.state.showSidebarArea);
        }
    }

    public onDestroy(): void {
        super.onDestroy();
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
    }

    private async prepareSidebars(): Promise<void> {
        this.state.sidebars = [];
        const sidebars = this.state.isLeft
            ? await this.context?.getSidebarsLeft()
            : await this.context?.getSidebarsRight();

        if (Array.isArray(sidebars)) {
            for (const cw of sidebars) {
                const template = await this.getSidebarTemplate(cw.instanceId);
                if (!this.state.sidebars.some((s) => s[0] === cw.instanceId)) {
                    this.state.sidebars.push(
                        [cw.instanceId, template, IdService.generateDateBasedId(cw.instanceId)]
                    );
                }
            }
        }
        (this as any).setStateDirty('sidebars');
    }

    public toggleSidebarArea(): void {
        this.state.showSidebarArea = !this.state.showSidebarArea;
        this.context?.toggleSidebar(this.state.showSidebarArea, this.state.isLeft, !this.state.isSmall);
        (this as any).emit('sidebarToggled', this.state.showSidebarArea);
    }

    public async getSidebarTemplate(instanceId: string): Promise<any> {
        const config = await this.context?.getWidgetConfiguration(instanceId);
        return KIXModulesService.getComponentTemplate(config?.widgetId);
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
