import { FilterCriteria } from '../../../model/FilterCriteria';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { BrowserUtil } from '../../base-components/webapp/core/BrowserUtil';
import { DateTimeUtil } from '../../base-components/webapp/core/DateTimeUtil';
import { KIXModulesService } from '../../base-components/webapp/core/KIXModulesService';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../base-components/webapp/core/LabelService';
import { DynamicFieldValue } from '../../dynamic-fields/model/DynamicFieldValue';
import { SearchOperator } from '../../search/model/SearchOperator';
import { Ticket } from '../../ticket/model/Ticket';
import { TicketProperty } from '../../ticket/model/TicketProperty';
import { TranslationService } from '../../translation/webapp/core/TranslationService';
import { User } from '../../user/model/User';
import { AgentService } from '../../user/webapp/core/AgentService';
import { CalendarConfiguration } from '../webapp/core/CalendarConfiguration';
import Calendar from 'tui-calendar';

export class CalendarInstance {

    private _calendar: any;
    private _calendarConfig: CalendarConfiguration;
    private _tickets: Ticket[];
    private _schedules: any[] = [];
    private _view: string;
    private _currentDate: string;
    private changeTimeout: any;
    private popupTimeout: any;
    private renderTimer: number | null = null;
    private resizeObserver: ResizeObserver | null = null;

    public constructor(private _calendarElementId: string) { }

    public destroy(): void {

        if (this.renderTimer) {
            cancelAnimationFrame(this.renderTimer);
        }

        if (this.popupTimeout) {
            clearTimeout(this.popupTimeout); this.popupTimeout = null;
        }

        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout); this.changeTimeout = null;
        }

        try {
            this.resizeObserver?.disconnect();
        } catch { /* ignore */ }

        this._calendar?.destroy?.();
        this._calendar = null;
    }

    public set calendarConfig(config: CalendarConfiguration) {
        this._calendarConfig = config;
    }

    public get calendarConfig(): CalendarConfiguration {
        return this._calendarConfig;
    }

    public set tickets(tickets: Ticket[]) {
        this._tickets = tickets || [];
    }

    public get currentDate(): string {
        return this._currentDate;
    }

    public set view(view: string) {
        this._view = view;
        this._calendar?.changeView(this.view, true);
    }

    public get view(): string {
        return this._view;
    }

    public set calendarElementId(id: string) {
        this._calendarElementId = id;
    }

    public get calendarElementId(): string {
        return this._calendarElementId;
    }

    public ready(): boolean {
        return this._calendar !== undefined && this._calendar !== null;
    }

    public async init(): Promise<any[]> {
        const tickets = await this.loadTickets();
        return this.createCalendar(tickets);
    }

    public render(): void {
        this._calendar.render(true);
    }

    public changeView(view: string): void {
        this._calendar.changeView(view, true);
    }

    public setCalendarDate(date: Date): void {
        this._calendar?.setDate(date);
    }

    public next(): void {
        this._calendar?.next();
    }

    public prev(): void {
        this._calendar.prev();
    }

    public toggleSchedules(calendarId: string, visible: boolean): void {
        this._calendar.toggleSchedules(calendarId, visible, true);
        this.scheduleRender();
    }

    private async loadTickets(): Promise<Ticket[]> {
        const user = await AgentService.getInstance().getCurrentUser();
        let tickets: Ticket[] = [];

        if (this._tickets?.length) {
            tickets = this._tickets;
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

    private async createCalendar(tickets: Ticket[]): Promise<any[]> {
        if (!this._calendarConfig) {
            this._calendarConfig = new CalendarConfiguration();
        }

        const calendars = await this.createCalendarForUser(tickets);

        if (this._calendar && Array.isArray(calendars)) {
            try {
                this._calendar.setCalendars(calendars);
            } catch { /* ignore */ }
        }

        this.clearSchedules();

        let created = false;
        if (!this._calendar) {
            created = await this.createCalendarElement(calendars);
        }

        await this.updateCalendarSchedules(tickets);

        if (created && this._calendar) {
            await this.setCurrentDate();
            this._calendar.on('beforeUpdateSchedule', this.scheduleChanged.bind(this));
            this._calendar.on('clickSchedule', this.scheduleClicked.bind(this));
            this._calendar.on('beforeCreateSchedule', (event: any): void => {
                const guide = event?.guide;
                guide?.clearGuideElement?.();
            });
        }

        return calendars;
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

    private async getUserIdMap(tickets: Ticket[] = []): Promise<Map<number, string>> {
        const userIdMap: Map<number, string> = new Map();

        tickets.forEach((t) => {
            if (!userIdMap.has(t.OwnerID)) {
                userIdMap.set(t.OwnerID, '');
            }
        });

        const userIds = Array.from(userIdMap.keys());

        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes = [KIXObjectType.CONTACT];

        const user = await KIXObjectService.loadObjects<User>(KIXObjectType.USER, userIds, loadingOptions)
            .catch((): User[] => []);

        for (const u of user) {
            const fullName = u.Contact?.Fullname || u.UserLogin;
            userIdMap.set(u.UserID, fullName);
        }

        return userIdMap;
    }

    private async createCalendarElement(calendars: any[]): Promise<boolean> {
        const dayNames = await this.getDayNames();
        const container = document.getElementById(this.calendarElementId);
        const pendingTranslation = await TranslationService.translate('Translatable#Pending');

        if (container) {
            this._calendar = new Calendar(`#${this.calendarElementId}`, {
                usageStatistics: false,
                defaultView: 'month',
                useDetailPopup: true,
                taskView: [],
                calendars,
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
        if (!Array.isArray(this._schedules)) {
            this._schedules = [];
        }

        if (this._calendar && this._schedules.length > 0) {
            try {
                this._schedules.forEach((s) => {
                    this._calendar.deleteSchedule(String(s.id), String(s.calendarId), true);
                });
            } catch {
                // ignore
            }
        }

        this._schedules = [];
        this.scheduleRender();
    }

    private async updateCalendarSchedules(tickets: Ticket[]): Promise<void> {
        this._schedules = (await this.createSchedules(tickets)).filter(Boolean);
        if (this._calendar && this._schedules.length) {
            this._calendar.createSchedules(this._schedules, true);
        }
        this.scheduleRender();
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
        const startValue = this.getScheduleDateValue(this._calendarConfig.startDateProperty, ticket);
        const endValue = this.getScheduleDateValue(this._calendarConfig.endDateProperty, ticket);

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

    public async setCurrentDate(render?: boolean): Promise<void> {
        if (!this._calendar || typeof this._calendar.getDate !== 'function') return;

        const tz = this._calendar.getDate && this._calendar.getDate();
        const currentDate: Date =
            tz && typeof tz.toDate === 'function'
                ? tz.toDate()
                : (tz instanceof Date ? tz : new Date());

        if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) return;

        const month = currentDate.getMonth();
        const monthLabel = await DateTimeUtil.getMonthName(currentDate);

        const weekLabel = await TranslationService.translate('Translatable#CW');
        let calendarWeekLabel = weekLabel;

        if (this.view === 'month') {
            const firstDayOfMonth = new Date(currentDate.getFullYear(), month, 1);
            const week1 = DateTimeUtil.getWeek(firstDayOfMonth);

            const lastDayOfMonth = new Date(currentDate.getFullYear(), month + 1, 0);
            const week2 = DateTimeUtil.getWeek(lastDayOfMonth);
            calendarWeekLabel += ` ${week1}-${week2}`;
        } else {
            const week = DateTimeUtil.getWeek(currentDate);
            calendarWeekLabel += ` ${week}`;
        }

        this._currentDate = `${monthLabel} ${currentDate.getFullYear()} | ${calendarWeekLabel}`;

        if (render) {
            this.scheduleRender();
        }
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
                        this._calendar?.updateSchedule(String(schedule.id), String(schedule.calendarId), changes, true);
                        this.scheduleRender();
                    })
                    .catch(() => null);
            }
        }, 100);
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

    private scheduleRender(): void {
        if (!this.ready()) {
            return;
        }

        if (this.renderTimer) {
            cancelAnimationFrame(this.renderTimer);
        }

        this.renderTimer = requestAnimationFrame(() => {
            try {
                this._calendar.render();
            } catch { /* ignore */ }
        });
    }


}