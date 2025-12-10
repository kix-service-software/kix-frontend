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
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { TicketProperty } from '../../../../ticket/model/TicketProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { Ticket } from '../../../../ticket/model/Ticket';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { DateTimeUtil } from '../../../../base-components/webapp/core/DateTimeUtil';
import { CalendarConfiguration } from '../../core/CalendarConfiguration';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import Calendar from 'tui-calendar';
import { User } from '../../../../user/model/User';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';

class Component extends AbstractMarkoComponent<ComponentState> {

    private calendar: any;
    private calendarConfig: CalendarConfiguration;
    private contextListenerId: string;
    private schedules: any[] = [];
    private popupTimeout: any;
    private tickets: Ticket[] = [];
    private updateTimeout: any;
    private changeTimeout: any;
    private resizeObserver: ResizeObserver | null = null;
    private renderTimer: number | null = null;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        if (input.active || typeof input.active === 'undefined') {
            this.tickets = input.objects || input.tickets || [];
            this.calendarConfig = input.calendarConfig;
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
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout); this.changeTimeout = null;
        }
        if (this.popupTimeout) {
            clearTimeout(this.popupTimeout); this.popupTimeout = null;
        }

        if (this.contextListenerId) {
            this.context?.unregisterListener?.(this.contextListenerId);
        }
        try { this.resizeObserver?.disconnect(); } catch { /* ignore */ }
        if (this.renderTimer) cancelAnimationFrame(this.renderTimer);
        this.calendar?.destroy?.();
        this.calendar = null;
    }

    private async waitForContainerReady(): Promise<void> {
        const el = document.getElementById(this.state.calendarId);
        let tries = 0;
        while (el && (el.offsetWidth === 0 || el.offsetHeight === 0) && tries < 40) {
            await new Promise((r) => setTimeout(r, 25));
            tries++;
        }
    }

    private scheduleRender(): void {
        if (!this.calendar) return;
        if (this.renderTimer) cancelAnimationFrame(this.renderTimer);
        this.renderTimer = requestAnimationFrame(() => {
            try { this.calendar.render(true); } catch { /* ignore */ }
        });
    }

    private async updateCalendar(): Promise<void> {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = null;
        }
        this.updateTimeout = setTimeout(async () => {
            const tickets = await this.loadTickets();
            await this.createCalendar(tickets);
            this.updateTimeout = null;
        }, 300);
    }

    private async initWidget(): Promise<void> {
        this.state.prepared = true;
        this.updateCalendar();
    }

    private async loadTickets(): Promise<Ticket[]> {
        const user = await AgentService.getInstance().getCurrentUser();
        let tickets: Ticket[] = [];

        if (this.tickets?.length) {
            tickets = this.tickets;
        } else {
            const ticketFilter = [
                new FilterCriteria(
                    TicketProperty.OWNER_ID, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND,
                    user.UserID
                ),
                new FilterCriteria(
                    TicketProperty.STATE_TYPE, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND,
                    ['Open']
                )
            ];

            tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, null, new KIXObjectLoadingOptions(
                    ticketFilter, null, null, [TicketProperty.STATE_TYPE, KIXObjectProperty.DYNAMIC_FIELDS]
                )
            );
        }

        return tickets || [];
    }

    private async createCalendar(tickets: Ticket[]): Promise<void> {
        if (!this.calendarConfig) {
            this.calendarConfig = new CalendarConfiguration();
        }

        this.state.calendars = await this.createCalendarForUser(tickets);

        if (this.calendar && Array.isArray(this.state.calendars)) {
            try { this.calendar.setCalendars(this.state.calendars); } catch { /* ignore */ }
        }

        this.clearSchedules();

        let created = false;
        if (!this.calendar) {
            created = await this.createCalendarElement();
        }

        await this.updateCalendarSchedules(tickets);

        if (created && this.calendar) {
            await this.setCurrentDate();
            this.calendar.on('beforeUpdateSchedule', this.scheduleChanged.bind(this));
            this.calendar.on('clickSchedule', this.scheduleClicked.bind(this));
            this.calendar.on('beforeCreateSchedule', (event: any): void => {
                const guide = event?.guide;
                guide?.clearGuideElement?.();
            });
        }
    }

    private async createCalendarForUser(tickets: Ticket[]): Promise<any[]> {
        const userIdMap = await this.getUserIdMap(tickets);

        const calendars: any[] = [];
        for (const u of userIdMap) {
            const bgColor = await BrowserUtil.getUserColor(u[0]);
            const overlay = await LabelService.getInstance().getOverlayIcon(
                KIXObjectType.USER, u[0]
            );
            calendars.push({
                id: String(u[0]),
                name: u[1],
                color: '#ffffff',
                bgColor,
                borderColor: bgColor,
                visible: true,
                overlay: overlay || null
            });
        }
        return calendars;
    }

    private async getUserIdMap(tickets: Ticket[]): Promise<Map<number, string>> {
        const userIds: Map<number, string> = new Map();
        for (const t of (tickets || [])) {
            if (!userIds.has(t.OwnerID)) {
                const loadingOptions = new KIXObjectLoadingOptions();
                loadingOptions.includes = [KIXObjectType.CONTACT];

                const user = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [t.OwnerID], loadingOptions
                ).catch((): User[] => []);

                const fullName = user?.length
                    ? user[0].Contact?.Fullname
                    : t.OwnerID.toString();

                userIds.set(t.OwnerID, fullName);
            }
        }
        return userIds;
    }

    private async createCalendarElement(): Promise<boolean> {
        const dayNames = await this.getDayNames();
        const container = document.getElementById(this.state.calendarId);
        const pendingTranslation = await TranslationService.translate('Translatable#Pending');

        if (container) {
            this.calendar = new Calendar(`#${this.state.calendarId}`, {
                usageStatistics: false,
                defaultView: 'month',
                useDetailPopup: true,
                taskView: [],
                calendars: this.state.calendars,
                month: {
                    moreLayerSize: { height: 'auto' },
                    narrowWeekend: true,
                    startDayOfWeek: 1,
                    visibleScheduleCount: 10,
                    daynames: dayNames,
                },
                week: {
                    narrowWeekend: true,
                    startDayOfWeek: 1,
                    daynames: dayNames,
                },
                template: {
                    time(schedule): string {
                        return `${schedule.raw?.StateType === 'pending reminder'
                            ? `<i class="fas fa-hourglass-half me-1" title="${pendingTranslation}"></i>`
                            : ''}${schedule.title}`;
                    },
                },
            });

            try {
                this.resizeObserver = new ResizeObserver(() => this.scheduleRender());
                this.resizeObserver.observe(container);
            } catch { /* older browsers */ }

            this.scheduleRender();

            return true;
        }
        return false;
    }

    private async getDayNames(): Promise<string[]> {
        const dayNameTranslations = await TranslationService.createTranslationObject([
            'Translatable#Sunday', 'Translatable#Monday', 'Translatable#Tuesday', 'Translatable#Wednesday',
            'Translatable#Thursday', 'Translatable#Friday', 'Translatable#Saturday'
        ]);
        const dayNames: string[] = [];
        for (const key in dayNameTranslations) {
            if (dayNameTranslations[key]) {
                dayNames.push(dayNameTranslations[key]);
            }
        }
        return dayNames;
    }

    private clearSchedules(): void {
        this.state.loading = true;

        if (!Array.isArray(this.schedules)) {
            this.schedules = [];
        }

        if (this.calendar && this.schedules.length > 0) {
            try {
                this.schedules.forEach((s) => {
                    this.calendar.deleteSchedule(String(s.id), String(s.calendarId), true);
                });
            } catch {
                // ignore
            }
        }

        this.schedules = [];
        this.scheduleRender();
    }

    private async updateCalendarSchedules(tickets: Ticket[]): Promise<void> {
        this.schedules = (await this.createSchedules(tickets)).filter(Boolean);
        if (this.calendar && this.schedules.length) {
            this.calendar.createSchedules(this.schedules, true);
        }
        this.scheduleRender();
        this.state.loading = false;
    }

    private async createSchedules(tickets: Ticket[]): Promise<any[]> {
        let list = tickets || [];

        if (list.length && !list.every((t) => t.DynamicFields)) {
            const ticketsWithDF = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, list.map((t) => t.TicketID),
                new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS])
            );

            if (Array.isArray(ticketsWithDF) && ticketsWithDF.length) {
                list = ticketsWithDF;
            }
        }

        const schedules: any[] = [];
        const promises: Promise<void>[] = [];

        for (const ticket of list) {
            const p = new Promise<void>(async (resolve) => {
                const title = await LabelService.getInstance().getObjectText(ticket, true);
                const isPending = ticket.StateType === 'pending reminder';
                const bgColor = await BrowserUtil.getUserColor(ticket.OwnerID);

                const base: any = {
                    id: String(ticket.TicketID),
                    calendarId: String(ticket.OwnerID),
                    title,
                    category: 'time',
                    raw: ticket,
                    borderColor: bgColor,
                };

                if (isPending) {
                    const pendingSchedule = { ...base };
                    pendingSchedule.id = 'pending-' + base.id;

                    const pendingDate = new Date(ticket.PendingTime);
                    if (!isNaN(pendingDate.getTime())) {
                        pendingSchedule.start = pendingDate;
                        const endDate = new Date(pendingDate);
                        endDate.setHours(endDate.getHours() + 1);
                        pendingSchedule.end = endDate;
                        schedules.push(pendingSchedule);
                    }
                }

                if (await this.setScheduleDates(ticket, base)) {
                    schedules.push(base);
                }

                resolve();
            });
            promises.push(p);
        }

        await Promise.all(promises);
        return schedules;
    }

    private async setScheduleDates(ticket: Ticket, schedule: any): Promise<boolean> {
        const startValue = this.getScheduleDateValue(this.calendarConfig.startDateProperty, ticket);
        const endValue = this.getScheduleDateValue(this.calendarConfig.endDateProperty, ticket);

        if (!startValue && !endValue) {
            return false;
        }

        if (startValue && endValue) {
            schedule.start = startValue;
            schedule.end = endValue;
            return true;
        }

        schedule.isAllDay = true;
        schedule.start = startValue ? startValue : endValue;
        schedule.end = endValue ? endValue : startValue;
        return true;
    }

    public getScheduleDateValue(property: string, ticket: Ticket): Date | null {
        if (ticket && (ticket as any)[property]) {
            const direct = new Date((ticket as any)[property]);
            return isNaN(direct.getTime()) ? null : direct;
        }

        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const dfValue = ticket?.DynamicFields?.find((df) => df.Name === dfName);
            const raw = dfValue?.Value?.[0];
            if (raw) {
                const parsed = new Date(raw);
                return isNaN(parsed.getTime()) ? null : parsed;
            }
        }

        return null;
    }

    private async scheduleChanged(event: any): Promise<void> {
        const schedule = event.schedule;
        const changes = event.changes;

        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }
        this.changeTimeout = setTimeout(async () => {
            if (!changes) return;

            const parameter: Array<[string, any]> = [];
            const today = new Date();

            if (schedule.raw.StateType === 'pending reminder' && isNaN(Number(schedule.id))) {
                if (changes.start) {
                    if (today > changes.start.toDate()) {
                        BrowserUtil.openErrorOverlay('Translatable#Pending date is not in the future.');
                    } else {
                        const pendingDate = DateTimeUtil.getKIXDateTimeString(changes.start.toDate());
                        parameter.push([TicketProperty.STATE_ID, schedule.raw.StateID]);
                        parameter.push([TicketProperty.PENDING_TIME, pendingDate]);
                    }
                } else if (changes.end) {
                    const newStart = schedule.end.toDate();
                    newStart.setHours(changes.end.toDate().getHours() - 1);
                    const pendingDate = DateTimeUtil.getKIXDateTimeString(newStart);
                    parameter.push([TicketProperty.STATE_ID, schedule.raw.StateID]);
                    parameter.push([TicketProperty.PENDING_TIME, pendingDate]);
                    (changes as any).start = newStart;
                }
            } else {
                const dfValue: DynamicFieldValue[] = [];
                if (changes.start) {
                    const startDate = DateTimeUtil.getKIXDateTimeString(changes.start.toDate());
                    dfValue.push({ Name: this.calendarConfig.startDateProperty, Value: [startDate] } as any);
                }

                if (changes.end) {
                    let end = changes.end.toDate();
                    if (changes.start?.toDate()?.getTime() === end.getTime()) {
                        end = changes.end.addMinutes(30).toDate();
                    }
                    const endDate = DateTimeUtil.getKIXDateTimeString(end);
                    dfValue.push({ Name: this.calendarConfig.endDateProperty, Value: [endDate] } as any);
                }

                if (dfValue.length) {
                    dfValue.forEach((df: DynamicFieldValue) => df.Name = df.Name.replace(
                        /^DynamicFields\.(.+)$/, '$1'
                    ));
                    parameter.push([KIXObjectProperty.DYNAMIC_FIELDS, dfValue]);
                }
            }

            if (parameter.length) {
                const id = isNaN(Number(schedule.id)) ? String(schedule.id).replace(/^pending-/, '') : schedule.id;
                KIXObjectService.updateObject(KIXObjectType.TICKET, parameter, id)
                    .then(() => {
                        this.calendar?.updateSchedule(String(schedule.id), String(schedule.calendarId), changes, true);
                        this.scheduleRender();
                    })
                    .catch(() => null);
            }
        }, 100);
    }

    public async changeView(): Promise<void> {
        this.state.view = this.state.view === 'month' ? 'week' : 'month';
        this.state.toggleLabel = this.state.view === 'month' ? 'Translatable#Week' : 'Translatable#Month';
        await this.setCurrentDate();
        this.calendar?.changeView(this.state.view, true);
        this.scheduleRender();
    }

    public async today(): Promise<void> {
        if (this.calendar) {
            this.calendar.setDate(new Date());
            this.calendar.changeView(this.state.view, true);
            await this.setCurrentDate();
            this.scheduleRender();
        }
    }

    public async next(): Promise<void> {
        if (this.calendar) {
            this.calendar.next();
            await this.setCurrentDate();
            this.scheduleRender();
        }
    }

    public async prev(): Promise<void> {
        if (this.calendar) {
            this.calendar.prev();
            await this.setCurrentDate();
            this.scheduleRender();
        }
    }

    private async scheduleClicked(event: any): Promise<void> {
        const schedule = event.schedule;
        if (schedule) {
            const template = KIXModulesService.getComponentTemplate('calendar-schedule-details');

            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.includes = [KIXObjectProperty.DYNAMIC_FIELDS];

            const tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, [schedule.raw.TicketID], loadingOptions
            );

            if (tickets && tickets.length) {

                if (this.popupTimeout) {
                    clearTimeout(this.popupTimeout);
                }

                this.popupTimeout = setTimeout(() => {
                    const content = template?.default?.renderSync({
                        ticket: tickets[0],
                        calendarConfig: this.calendarConfig,
                        isPending: isNaN(Number(schedule.id))
                    });

                    const items = document.getElementsByClassName('tui-full-calendar-popup-container');
                    if (items?.length) {
                        (items.item(0) as HTMLElement).innerHTML = '';
                        content.appendTo(items.item(0));
                    }
                }, 50);
            }
        }
    }

    private async setCurrentDate(): Promise<void> {
        if (!this.calendar || typeof this.calendar.getDate !== 'function') return;

        const tz = this.calendar.getDate && this.calendar.getDate();
        const currentDate: Date =
            tz && typeof tz.toDate === 'function'
                ? tz.toDate()
                : (tz instanceof Date ? tz : new Date());

        if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) return;

        const month = currentDate.getMonth();
        const monthLabel = await DateTimeUtil.getMonthName(currentDate);

        const weekLabel = await TranslationService.translate('Translatable#CW');
        let calendarWeekLabel = weekLabel;

        if (this.state.view === 'month') {
            const firstDayOfMonth = new Date(currentDate.getFullYear(), month, 1);
            const week1 = DateTimeUtil.getWeek(firstDayOfMonth);

            const lastDayOfMonth = new Date(currentDate.getFullYear(), month + 1, 0);
            const week2 = DateTimeUtil.getWeek(lastDayOfMonth);
            calendarWeekLabel += ` ${week1}-${week2}`;
        } else {
            const week = DateTimeUtil.getWeek(currentDate);
            calendarWeekLabel += ` ${week}`;
        }

        this.state.currentDate = `${monthLabel} ${currentDate.getFullYear()} | ${calendarWeekLabel}`;
    }

    public toggleCalendar(calendar: any): void {
        const cal = this.state.calendars.find((c) => String(c.id) === String(calendar.id));
        if (!cal) return;
        cal.visible = !cal.visible;
        (this as any).setStateDirty('calendars');
        this.calendar?.toggleSchedules(String(cal.id), !cal.visible, true);
        this.scheduleRender();
    }

}

module.exports = Component;