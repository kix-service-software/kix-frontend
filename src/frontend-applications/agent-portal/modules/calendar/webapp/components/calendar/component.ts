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
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { Context } from '../../../../../model/Context';
import Calendar from 'tui-calendar';
import { User } from '../../../../user/model/User';

declare const tui: any;

class Component extends AbstractMarkoComponent<ComponentState> {

    private calendar: any;
    private calendarConfig: CalendarConfiguration;
    private contextListenerId: string;
    private creatingCalendar: boolean;
    private schedules: any[];
    private context: Context;
    private popupTimeout: any;
    private tickets: Ticket[] = [];
    private updateTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.tickets = input.tickets || [];
        this.calendarConfig = input.calendarConfig;

        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(() => this.updateCalendar(), 250);
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.initWidget();
    }

    public onDestroy(): void {
        this.context?.unregisterListener(this.contextListenerId);
        this.calendar?.destroy();
    }

    private async updateCalendar(): Promise<void> {
        const tickets = await this.loadTickets();
        setTimeout(async () => {
            await this.createCalendar(tickets);
        }, 100);
    }

    private async initWidget(): Promise<void> {
        if (this.creatingCalendar) {
            return;
        }

        this.creatingCalendar = true;

        const tickets = await this.loadTickets();
        this.state.prepared = true;

        setTimeout(async () => {
            await this.createCalendar(tickets);
            this.creatingCalendar = false;
        }, 100);
    }

    private async loadTickets(): Promise<Ticket[]> {
        const user = await AgentService.getInstance().getCurrentUser();
        let tickets = [];

        if (this.tickets?.length) {
            tickets = this.tickets;
        } else {
            const ticketFilter = [
                new FilterCriteria(
                    TicketProperty.OWNER_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND,
                    user.UserID
                ),
                new FilterCriteria(
                    TicketProperty.STATE_TYPE, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND,
                    ['Open']
                )
            ];

            tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, null, new KIXObjectLoadingOptions(
                    ticketFilter, null, null, [TicketProperty.STATE_TYPE, KIXObjectProperty.DYNAMIC_FIELDS]
                )
            );
        }

        return tickets;
    }

    private async createCalendar(tickets: Ticket[]): Promise<void> {
        if (!this.calendarConfig) {
            this.calendarConfig = new CalendarConfiguration();
        }

        this.state.calendars = await this.createCalendarForUser(tickets);

        this.clearSchedules();

        if (!this.calendar) {
            await this.createCalendarElement();
        }

        await this.updateCalendarSchedules(tickets);
        this.setCurrentDate();

        this.calendar.on('beforeUpdateSchedule', this.scheduleChanged.bind(this));
        this.calendar.on('clickSchedule', this.scheduleClicked.bind(this));
        this.calendar.on('beforeCreateSchedule', (event) => {
            const guide = event.guide;
            guide.clearGuideElement();
        });
    }

    private async createCalendarForUser(tickets: Ticket[]): Promise<any[]> {
        const userIdMap = await this.getUserIdMap(tickets);

        const calendars = [];
        for (const u of userIdMap) {
            const bgColor = BrowserUtil.getUserColor(u[0]);
            const overlay = await LabelService.getInstance().getOverlayIcon(
                KIXObjectType.USER, u[0]
            );
            calendars.push({
                id: u[0],
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
        for (const t of tickets) {
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

    private async createCalendarElement(): Promise<void> {
        const dayNames = await this.getDayNames();
        const calendar = document.getElementById(this.state.calendarId);
        if (calendar) {
            this.calendar = new Calendar(`#${this.state.calendarId}`, {
                defaultView: 'month',
                useDetailPopup: true,
                taskView: [],
                calendars: this.state.calendars,
                month: {
                    moreLayerSize: {
                        height: 'auto'
                    },
                    narrowWeekend: true,
                    startDayOfWeek: 1, // monday
                    visibleScheduleCount: 10,
                    daynames: dayNames,
                },
                week: {
                    narrowWeekend: true,
                    startDayOfWeek: 1, // monday
                    daynames: dayNames,
                }
            });
        }
    }

    private async getDayNames(): Promise<string[]> {
        const dayNameTranslations = await TranslationService.createTranslationObject([
            'Translatable#Sunday', 'Translatable#Monday', 'Translatable#Tuesday', 'Translatable#Wednesday', 'Translatable#Thursday', 'Translatable#Friday', 'Translatable#Saturday'
        ]);
        const dayNames = [];
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
        if (this.schedules.length > 0) {
            this.schedules.forEach((s) => this.calendar?.deleteSchedule(s.id, s.calendarId));
        }

        this.calendar?.clear(true);

        this.schedules = [];
    }

    private async updateCalendarSchedules(tickets: Ticket[]): Promise<void> {
        this.schedules = await this.createSchedules(tickets);
        this.calendar.createSchedules(this.schedules.filter((s) => s));
        this.state.loading = false;
    }

    private async createSchedules(tickets: Ticket[]): Promise<any[]> {
        const schedules = [];

        if (tickets?.length && !tickets.every((t) => t.DynamicFields)) {
            const ticketsWithDF = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, tickets.map((t) => t.TicketID),
                new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS])
            );

            if (Array.isArray(ticketsWithDF) && ticketsWithDF.length) {
                tickets = ticketsWithDF;
            }
        }


        const promises: Promise<void>[] = [];
        for (const ticket of tickets) {
            const promise = new Promise<void>(async (resolve) => {

                const title = await LabelService.getInstance().getObjectText(ticket, true);
                const isPending = ticket.StateType === 'pending reminder';
                const bgColor = BrowserUtil.getUserColor(ticket.OwnerID);
                const schedule: any = {
                    id: ticket.TicketID,
                    calendarId: ticket.OwnerID,
                    title,
                    category: 'time',
                    raw: ticket,
                    borderColor: bgColor,
                };

                if (isPending) {
                    const pendingSchedule = { ...schedule };
                    pendingSchedule.id = 'pending-' + pendingSchedule.id;

                    const pendingDate = new Date(ticket.PendingTime);
                    if (!isNaN(pendingDate.getTime())) {
                        pendingSchedule.start = pendingDate;
                        const endDate = new Date(pendingDate);
                        endDate.setHours(endDate.getHours() + 1);

                        pendingSchedule.end = pendingDate;
                        schedules.push(pendingSchedule);
                    }
                }

                if (await this.setScheduleDates(ticket, schedule)) {
                    schedules.push(schedule);
                }

                resolve();
            });
            promises.push(promise);
        }

        await Promise.all(promises);
        return schedules;
    }

    private async setScheduleDates(ticket: Ticket, schedule: any): Promise<boolean> {
        const startValue = this.getScheduleDateValue(this.calendarConfig.startDateProperty, ticket);
        const endValue = this.getScheduleDateValue(this.calendarConfig.endDateProperty, ticket);

        let isSchedule = false;

        if (!startValue && !endValue) {
            isSchedule = false;
        } else if (startValue && endValue) {
            schedule.start = startValue;
            schedule.end = endValue;
            isSchedule = true;
        } else if (((startValue && !endValue) || (!startValue && endValue))) {
            schedule.isAllDay = true;
            schedule.start = startValue ? startValue : endValue;
            schedule.end = endValue ? endValue : startValue;
            isSchedule = true;
        }

        return isSchedule;
    }

    public getScheduleDateValue(property: string, ticket: Ticket): Date {
        let value = new Date(ticket[property]);
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const dfValue = ticket.DynamicFields.find((df) => df.Name === dfName);
            value = dfValue?.Value?.length ? new Date(dfValue.Value[0]) : new Date();
        }
        return value;
    }

    private async scheduleChanged(event): Promise<void> {
        const schedule = event.schedule;
        const changes = event.changes;

        if (changes) {
            const parameter = [];

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

                    changes.start = newStart;
                }
            } else {
                const dfValue = [];
                if (changes.start) {
                    const startDate = DateTimeUtil.getKIXDateTimeString(changes.start.toDate());
                    dfValue.push({ Name: this.calendarConfig.startDateProperty, Value: startDate });
                }

                if (changes.end) {
                    const endDate = DateTimeUtil.getKIXDateTimeString(changes.end.toDate());
                    dfValue.push({ Name: this.calendarConfig.endDateProperty, Value: endDate });
                }

                if (dfValue.length) {
                    parameter.push([KIXObjectProperty.DYNAMIC_FIELDS, dfValue]);
                }
            }

            if (parameter.length) {
                const id = isNaN(Number(schedule.id)) ? schedule.id.replace(/^pending-/, '') : schedule.id;
                KIXObjectService.updateObject(KIXObjectType.TICKET, parameter, id)
                    .then(() => {
                        this.calendar.updateSchedule(schedule.id, schedule.calendarId, changes);
                        const context = ContextService.getInstance().getActiveContext();
                        if (context) {
                            context.reloadObjectList(KIXObjectType.TICKET, true);
                        }
                    })
                    .catch(() => null);
            }
        }
    }

    public changeView(): void {
        this.state.view = this.state.view === 'month' ? 'week' : 'month';
        this.state.toggleLabel = this.state.view === 'month' ? 'Translatable#Week' : 'Translatable#Month';
        this.setCurrentDate();
        this.calendar.changeView(this.state.view, true);
    }

    public today(): void {
        if (this.calendar) {
            this.calendar.setDate(new Date());
            this.calendar.changeView(this.state.view, true);
            this.setCurrentDate();
        }
    }

    public next(): void {
        if (this.calendar) {
            this.calendar.next();
            this.setCurrentDate();
        }
    }

    public prev(): void {
        if (this.calendar) {
            this.calendar.prev();
            this.setCurrentDate();
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
                        items.item(0).innerHTML = '';
                        content.appendTo(items.item(0));
                    }
                }, 50);
            }
        }
    }

    private async setCurrentDate(): Promise<void> {
        const currentDate = this.calendar.getDate().toDate();
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
        const cal = this.state.calendars.find((c) => c.id === calendar.id);
        cal.visible = !cal.visible;
        (this as any).setStateDirty('calendars');
        this.calendar.toggleSchedules(cal.id, !cal.visible);
    }

}

module.exports = Component;
