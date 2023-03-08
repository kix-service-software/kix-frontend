/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../model/IdService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Context } from '../../../../../model/Context';
import { ContextType } from '../../../../../model/ContextType';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { MobileShowEvent } from '../../../../agent-portal/model/MobileShowEvent';
import { EventService } from '../../core/EventService';
import { MobileShowEventData } from '../../../../agent-portal/model/MobileShowEventData';
import { KIXStyle } from '../../../model/KIXStyle';

class Component {

    private state: ComponentState;
    private contextServiceListernerId: string;
    public eventSubscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextServiceListernerId = IdService.generateDateBasedId('sidebar-');
        this.state.isLeft = input.isLeft;
    }

    public async onMount(): Promise<void> {
        ContextService.getInstance().registerListener({
            constexServiceListenerId: this.contextServiceListernerId,
            contextChanged: (contextId: string, context: Context, type: ContextType) => {
                this.setContext(context);
                this.handleShowSidebarAreaState(context);
            },
            contextRegistered: () => { return; },
            beforeDestroy: () => null
        });
        this.setContext(ContextService.getInstance().getActiveContext());

        this.state.translations = await TranslationService.createTranslationObject(
            [
                'Translatable#Close Sidebars',
                'Translatable#Open Sidebars'
            ]
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
        ContextService.getInstance().unregisterListener(this.contextServiceListernerId);
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
        EventService.getInstance().unsubscribe(MobileShowEvent.SHOW_MOBILE, this.eventSubscriber);
    }

    private setContext(context: Context): void {
        this.updateSidebars(context);
    }

    private async updateSidebars(context: Context): Promise<void> {
        this.state.sidebars = [];
        if (context) {
            const sidebars = this.state.isLeft
                ? await context.getSidebarsLeft()
                : await context.getSidebarsRight();

            if (Array.isArray(sidebars)) {
                for (const cw of sidebars) {
                    const template = await this.getSidebarTemplate(cw.instanceId);
                    this.state.sidebars.push([cw.instanceId, template, IdService.generateDateBasedId(cw.instanceId)]);
                }
            }
        }
        (this as any).setStateDirty('sidebars');
    }

    public toggleSidebarArea(): void {
        this.state.showSidebarArea = !this.state.showSidebarArea;
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            context.toggleSidebar(this.state.showSidebarArea, this.state.isLeft, !this.state.isSmall);
        }
    }

    public async getSidebarTemplate(instanceId: string): Promise<any> {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? await context.getWidgetConfiguration(instanceId) : undefined;
        return config ? KIXModulesService.getComponentTemplate(config.widgetId) : undefined;
    }
}

module.exports = Component;
