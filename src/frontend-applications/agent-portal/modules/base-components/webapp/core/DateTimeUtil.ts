/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import dateFormat from 'dateformat';
import { KIXModulesService } from './KIXModulesService';

export class DateTimeUtil {

    public static async getLocalDateString(value: any, language?: string): Promise<string> {
        let string = '';
        if (value) {
            if (typeof value === 'string') {
                value = value.replace(/-/g, '/');
            }

            const date = new Date(value);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            } as const;

            if (!language) {
                language = await TranslationService.getUserLanguage();
            }
            string = language ? date.toLocaleDateString(language, options) : value;
        }
        return string;
    }

    public static async getLocalDateTimeString(value: any, language?: string, useOffset?: boolean): Promise<string> {
        let string = '';
        if (value) {
            if (typeof value === 'string') {
                value = value.replace(/-/g, '/');
            }
            const date = new Date(value);

            if (useOffset) {
                const offset = await KIXModulesService.getInstance().getBackenTimezoneOffset();
                date.setSeconds(date.getSeconds() + offset);
            }

            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            } as const;

            if (!language) {
                language = await TranslationService.getUserLanguage();
            }
            string = language ? date.toLocaleString(language, options) : value;
        }
        return string;
    }

    public static async getLocalDateTimeStringByTimeZone(
        utcTime: any, timeZone: string, language?: string
    ): Promise<string> {
        let string = '';
        if (utcTime) {
            // use utc (timestamp) as local date to geht single values (year, month, ...) as they are
            let UTCDate = new Date(utcTime);
            UTCDate = new Date(Date.UTC(
                UTCDate.getFullYear(),
                UTCDate.getMonth(),
                UTCDate.getDate(),
                UTCDate.getHours(),
                UTCDate.getMinutes(),
                UTCDate.getSeconds()
            ));

            const userLanguage = await TranslationService.getUserLanguage();
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone,
                timeZoneName: 'longOffset'
            } as any; // FIXME: use "any" or else will be an error:
            // error TS2322: Type '"longOffset"' is not assignable to type '"long" | "short"'

            string = UTCDate.toLocaleString(userLanguage, options);
        }
        return string;
    }

    public static calculateTimeInterval(seconds: number, noDays?: boolean): string {
        let isNegative = false;
        if (seconds < 0) {
            isNegative = true;
            seconds = seconds * -1;
        }

        const hoursInSeconds = 60 * 60;
        const daysInSeconds = 24 * hoursInSeconds;

        const days = !noDays ? Math.floor(seconds / daysInSeconds) : 0;
        const hours = Math.floor((seconds - (days * daysInSeconds)) / hoursInSeconds);
        const minutes = Math.round((seconds - (days * daysInSeconds) - (hours * hoursInSeconds)) / 60);

        const ageResult = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;

        return isNegative ? '- ' + ageResult : ageResult;
    }

    public static getKIXDateTimeString(date: Date | string, asUTC: boolean = false): string {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        return `${DateTimeUtil.getKIXDateString(date, asUTC)} ${DateTimeUtil.getKIXTimeString(date, false, null, asUTC)}`;
    }

    public static getKIXDateString(date: Date, asUTC: boolean = false): string {
        let kixDateString, year, month, day;
        if (date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }

            if (asUTC) {
                year = date.getUTCFullYear();
                month = DateTimeUtil.padZero(date.getUTCMonth() + 1);
                day = DateTimeUtil.padZero(date.getUTCDate());
            }
            else {
                year = date.getFullYear();
                month = DateTimeUtil.padZero(date.getMonth() + 1);
                day = DateTimeUtil.padZero(date.getDate());
            }

            kixDateString = `${year}-${month}-${day}`;
        }
        return kixDateString;
    }

    public static getKIXTimeString(
        date: Date, short: boolean = true, roundHalfHour?: boolean, asUTC: boolean = false
    ): string {
        let kixTimeString, hours, minutes, seconds;
        if (date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }

            if (asUTC) {
                hours = DateTimeUtil.padZero(date.getUTCHours());
                minutes = DateTimeUtil.padZero(date.getUTCMinutes());
                seconds = DateTimeUtil.padZero(date.getUTCSeconds());
            }
            else {
                hours = DateTimeUtil.padZero(date.getHours());
                minutes = DateTimeUtil.padZero(date.getMinutes());
                seconds = DateTimeUtil.padZero(date.getSeconds());
            }

            if (roundHalfHour) {
                minutes = Number(minutes) <= 15 || Number(minutes) >= 30 ? '00' : '30';
            }
            kixTimeString = `${hours}:${minutes}`;
            if (!short) {
                kixTimeString += `:${seconds}`;
            }
        }
        return kixTimeString;
    }

    public static getTimestampNumbersOnly(date: Date, withSeconds?: boolean, dateOnly?: boolean): string {
        if (date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            const year = date.getFullYear();
            const month = DateTimeUtil.padZero(date.getMonth() + 1);
            const day = DateTimeUtil.padZero(date.getDate());
            const hours = DateTimeUtil.padZero(date.getHours());
            const minutes = DateTimeUtil.padZero(date.getMinutes());
            const seconds = DateTimeUtil.padZero(date.getSeconds());

            if (dateOnly) {
                return `${year}${month}${day}`;
            }

            return `${year}${month}${day}${hours}${minutes}${withSeconds ? seconds : ''}`;
        }

        return null;
    }

    public static sameDay(d1: Date, d2: Date): boolean {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    public static betweenDays(d1: Date, d2: Date, withTime?: boolean, withSeconds?: boolean): boolean {
        const currDate = new Date();
        const currStamp = this.getTimestampNumbersOnly(currDate, withSeconds, !withTime);
        const d1Stamp = this.getTimestampNumbersOnly(d1, withSeconds, !withTime);
        const d2Stamp = this.getTimestampNumbersOnly(d2, withSeconds, !withTime);

        return currStamp >= d1Stamp && currStamp <= d2Stamp;
    }

    public static getTimeByMillisec(millisec: number): string {

        let seconds: string = (millisec / 1000).toFixed(0);
        let minutes: string = DateTimeUtil.padZero(Math.floor(Number(seconds) / 60));
        let hours: string = '';

        if (Number(minutes) > 59) {
            hours = DateTimeUtil.padZero(Math.floor(Number(minutes) / 60));
            minutes = DateTimeUtil.padZero((Number(minutes) - (Number(hours) * 60)));
        }
        seconds = DateTimeUtil.padZero(Math.floor(Number(seconds) % 60));

        if (hours === '') {
            hours = '00';
        }

        return `${hours}:${minutes}:${seconds}`;
    }

    public static getDayString(key: string): string {
        switch (key) {
            case 'Mon':
                return 'Translatable#Monday';
            case 'Tue':
                return 'Translatable#Tuesday';
            case 'Wed':
                return 'Translatable#Wednesday';
            case 'Thu':
                return 'Translatable#Thursday';
            case 'Fri':
                return 'Translatable#Friday';
            case 'Sat':
                return 'Translatable#Saturday';
            case 'Sun':
                return 'Translatable#Sunday';
            default:
                return key;
        }
    }

    private static padZero(value: number): string {
        return (value < 10 ? '0' + value : value).toString();
    }

    public static getWeek(date: Date): number {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = ((date as any) - (firstDayOfYear as any)) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    public static async getMonthName(date: Date, language?: string): Promise<string> {
        if (!language) {
            language = await TranslationService.getUserLanguage();
        }
        return date.toLocaleString(language, { month: 'long' });
    }

    public static getDateFromLocalString(localDate: string): Date {
        const parts = localDate.split('.');
        if (parts && parts.length === 3) {
            return new Date(parts[1] + '/' + parts[0] + '/' + parts[2]);
        }
        return new Date();
    }

    public static format(date: Date, format: string): string {
        return dateFormat(date, format);
    }

    public static calculateRelativeDate(value: string): string {
        if (Array.isArray(value)) {
            value = value.length ? value[0] : null;
        }

        const parts = value?.split(/(\d+)/) || [];
        if (value && parts.length === 3) {
            value = DateTimeUtil.calculateDate(Number(parts[1]), parts[2].toString());
        }
        return value;
    }

    public static calculateDate(value: number, unit: string): string {
        const date = new Date();
        switch (unit) {
            case 'm':
                date.setMinutes(date.getMinutes() + value);
                break;
            case 'h':
                date.setHours(date.getHours() + value);
                break;
            case 'd':
                const dayOffset = value * 60 * 60 * 24;
                date.setSeconds(date.getSeconds() + dayOffset);
                break;
            case 'w':
                const weekOffset = value * 60 * 60 * 24 * 7;
                date.setSeconds(date.getSeconds() + weekOffset);
                break;
            case 'M':
                date.setMonth(date.getMonth() + value);
                break;
            case 'Y':
                date.setFullYear(date.getFullYear() + value);
                break;
            default:
        }

        return DateTimeUtil.getKIXDateTimeString(date);
    }

    public static getSeconds(value: number, unit: string): number {
        switch (unit) {
            case 'm':
                return value * 60;
            case 'h':
                return value * 60 * 60;
            case 'd':
                return value * 60 * 60 * 24;
            case 'w':
                return value * 60 * 60 * 24 * 7;
            case 'M':
                return value * 60 * 60 * 24 * 30;
            case 'Y':
                return value * 60 * 60 * 24 * 365;
            default:
                return value;
        }
    }

}
