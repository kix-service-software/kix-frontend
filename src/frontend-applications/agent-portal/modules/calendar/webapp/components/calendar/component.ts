/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { CalendarInstance } from '../../../model/CalendarInstance';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextListenerId: string;
    private updateTimeout: any;
    private calendarInstance: CalendarInstance;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
        this.calendarInstance = new CalendarInstance(this.state.calendarId);
    }

    public onInput(input: any): void {
        super.onInput(input);
        if (input.active || typeof input.active === 'undefined') {
            this.calendarInstance.tickets = input.objects || input.tickets || [];
            this.calendarInstance.calendarConfig = input.calendarConfig;
            this.updateCalendar();
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        super.registerEventSubscriber(
            function (data: any, eventId: string): void {
                const isTicketEvent =
                    data?.objectType === KIXObjectType.TICKET ||
                    data?.type === KIXObjectType.TICKET ||
                    data?.KIXObjectType === KIXObjectType.TICKET ||
                    data?.object === 'Ticket' ||
                    /TICKET/i.test(eventId || '');
                if (isTicketEvent) {
                    this.updateCalendar();
                }
            },
            [
                ApplicationEvent.OBJECT_CREATED,
                ApplicationEvent.OBJECT_UPDATED,
                ApplicationEvent.OBJECT_DELETED,
                'OBJECTS_RELOADED',
                'RELOAD_OBJECT_LIST',
                'RELOAD_OBJECT',
                'TICKET_CREATED',
                'TICKET_UPDATED',
                'TICKET_DELETED',
                'TICKET_RELOADED'
            ]
        );

        await this.waitForContainerReady();

        this.initWidget();
    }

    public onDestroy(): void {
        super.onDestroy();

        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout); this.updateTimeout = null;
        }

        if (this.contextListenerId) {
            this.context?.unregisterListener?.(this.contextListenerId);
        }

        this.calendarInstance?.destroy();
    }

    private async waitForContainerReady(): Promise<void> {
        const el = document.getElementById(this.state.calendarId);
        let tries = 0;
        while (el && (el.offsetWidth === 0 || el.offsetHeight === 0) && tries < 40) {
            await new Promise((r) => setTimeout(r, 25));
            tries++;
        }
    }

    private async initWidget(): Promise<void> {
        this.state.prepared = true;
        this.updateCalendar();
    }

    private async updateCalendar(): Promise<void> {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = null;
        }
        this.updateTimeout = setTimeout(async () => {
            this.state.calendars = await this.calendarInstance.init();
            this.state.currentDate = this.calendarInstance.currentDate;
            this.updateTimeout = null;
        }, 300);
    }

    public async changeView(): Promise<void> {
        this.state.view = this.state.view === 'month' ? 'week' : 'month';
        this.calendarInstance.view = this.state.view;
        this.state.toggleLabel = this.state.view === 'month' ? 'Translatable#Week' : 'Translatable#Month';
        await this.calendarInstance.setCurrentDate(true);
        this.state.currentDate = this.calendarInstance.currentDate;
    }

    public async today(): Promise<void> {
        if (this.calendarInstance.ready()) {
            this.calendarInstance.setCalendarDate(new Date());
            this.calendarInstance.changeView(this.state.view);
            await this.calendarInstance.setCurrentDate(true);
            this.state.currentDate = this.calendarInstance.currentDate;
        }
    }

    public async next(): Promise<void> {
        if (this.calendarInstance.ready()) {
            this.calendarInstance.next();
            await this.calendarInstance.setCurrentDate(true);
            this.state.currentDate = this.calendarInstance.currentDate;
        }
    }

    public async prev(): Promise<void> {
        if (this.calendarInstance.ready()) {
            this.calendarInstance.prev();
            await this.calendarInstance.setCurrentDate(true);
            this.state.currentDate = this.calendarInstance.currentDate;
        }
    }

    public toggleCalendar(calendar: any): void {
        const cal = this.state.calendars.find((c) => String(c.id) === String(calendar.id));
        if (!cal) {
            return;
        }

        cal.visible = !cal.visible;
        (this as any).setStateDirty('calendars');
        this.calendarInstance?.toggleSchedules(String(cal.id), !cal.visible);
    }

}

module.exports = Component;