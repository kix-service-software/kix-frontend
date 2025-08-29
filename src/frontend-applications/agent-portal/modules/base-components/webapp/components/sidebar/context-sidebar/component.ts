/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../../model/IdService';
import { ContextService } from '../../../core/ContextService';
import { Context } from '../../../../../../model/Context';
import { KIXModulesService } from '../../../core/KIXModulesService';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { IEventSubscriber } from '../../../core/IEventSubscriber';
import { MobileShowEvent } from '../../../../../agent-portal/model/MobileShowEvent';
import { EventService } from '../../../core/EventService';
import { MobileShowEventData } from '../../../../../agent-portal/model/MobileShowEventData';
import { KIXStyle } from '../../../../model/KIXStyle';
import { AbstractMarkoComponent } from '../../../core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public eventSubscriber: IEventSubscriber;

    public onCreate(input: any): void {
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

        this.eventSubscriber = {
            eventSubscriberId: `sidebar-mobile-${this.state.isLeft ? 'left' : 'right'}`,
            eventPublished: (data, eventId: MobileShowEvent | string): void => {
                if (eventId === MobileShowEvent.SHOW_MOBILE) {
                    this.state.showMobile
                        = (this.state.isLeft && data === MobileShowEventData.SHOW_LEFT_SIDEBAR)
                        || (!this.state.isLeft && data === MobileShowEventData.SHOW_RIGHT_SIDEBAR);
                }
            }
        };

        EventService.getInstance().subscribe(MobileShowEvent.SHOW_MOBILE, this.eventSubscriber);
    }

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= KIXStyle.MOBILE_BREAKPOINT);
        this.state.isSmall = this.state.isLeft
            ? Boolean(window.innerWidth <= 1300) : Boolean(window.innerWidth <= 1600);
        this.handleShowSidebarAreaState();
    }

    private handleShowSidebarAreaState(context: Context = ContextService.getInstance().getActiveContext()): void {
        if (this.state.isSmall) {
            if (this.state.showSidebarArea) {
                this.toggleSidebarArea();
            }
        } else if (context) {
            this.state.showSidebarArea = context.isSidebarOpen(this.state.isLeft);
        }
    }

    public onDestroy(): void {
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
        EventService.getInstance().unsubscribe(MobileShowEvent.SHOW_MOBILE, this.eventSubscriber);
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
    }

    public async getSidebarTemplate(instanceId: string): Promise<any> {
        const config = await this.context?.getWidgetConfiguration(instanceId);
        return KIXModulesService.getComponentTemplate(config?.widgetId);
    }
}

module.exports = Component;
