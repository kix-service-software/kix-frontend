/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TranslationAPIService } from '../../modules/translation/server/TranslationService';

export class DateTimeAPIUtil {

    public static async getLocalDateString(token: string, value: any, language?: string): Promise<string> {
        let string = '';
        if (value) {
            const date = new Date(value);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            } as const;

            if (!language) {
                language = await TranslationAPIService.getUserLanguage(token);
            }
            string = language ? date.toLocaleDateString(language, options) : value;
        }
        return string;
    }

    public static async getLocalDateTimeString(token: string, value: any, language?: string): Promise<string> {
        let string = '';
        if (value) {
            const date = new Date(value);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            } as const;

            if (!language) {
                language = await TranslationAPIService.getUserLanguage(token);
            }
            string = language ? date.toLocaleString(language, options) : value;
        }
        return string;
    }

    public static calculateTimeInterval(seconds: number, noDays?: boolean): string {
        let isNegative = false;
        if (seconds < 0) {
            isNegative = true;
            seconds = seconds * -1;
        }
        let ageResult = seconds + 's';

        const hoursInSeconds = 60 * 60;
        const daysInSeconds = 24 * hoursInSeconds;

        const days = !noDays ? Math.floor(seconds / daysInSeconds) : 0;
        const hours = Math.floor((seconds - (days * daysInSeconds)) / hoursInSeconds);
        const minutes = Math.round((seconds - (days * daysInSeconds) - (hours * hoursInSeconds)) / 60);

        if (days === 0) {
            ageResult = hours + 'h ' + minutes + 'm';
        } else {
            ageResult = days + 'd ' + hours + 'h';
        }

        return isNegative ? '- ' + ageResult : ageResult;
    }

    public static getKIXDateTimeString(date: Date): string {
        return `${DateTimeAPIUtil.getKIXDateString(date)} ${DateTimeAPIUtil.getKIXTimeString(date, false)}`;
    }

    public static getKIXDateString(date: Date): string {
        let kixDateString;
        if (date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            const year = date.getFullYear();
            const month = DateTimeAPIUtil.padZero(date.getMonth() + 1);
            const day = DateTimeAPIUtil.padZero(date.getDate());
            kixDateString = `${year}-${month}-${day}`;
        }
        return kixDateString;
    }

    public static getKIXTimeString(date: Date, short: boolean = true): string {
        let kixTimeString;
        if (date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            const hours = DateTimeAPIUtil.padZero(date.getHours());
            const minutes = DateTimeAPIUtil.padZero(date.getMinutes());
            const seconds = DateTimeAPIUtil.padZero(date.getSeconds());
            kixTimeString = `${hours}:${minutes}`;
            if (!short) {
                kixTimeString += `:${seconds}`;
            }
        }
        return kixTimeString;
    }

    public static getTimestampNumbersOnly(date: Date, withSeconds?: boolean): string {
        if (date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            const year = date.getFullYear();
            const month = DateTimeAPIUtil.padZero(date.getMonth() + 1);
            const day = DateTimeAPIUtil.padZero(date.getDate());
            const hours = DateTimeAPIUtil.padZero(date.getHours());
            const minutes = DateTimeAPIUtil.padZero(date.getMinutes());
            const seconds = DateTimeAPIUtil.padZero(date.getSeconds());
            return `${year}${month}${day}${hours}${minutes}${withSeconds ? seconds : ''}`;
        }

        return null;
    }

    public static sameDay(d1: Date, d2: Date): boolean {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    public static getTimeByMillisec(millisec: number): string {

        let seconds: string = (millisec / 1000).toFixed(0);
        let minutes: string = DateTimeAPIUtil.padZero(Math.floor(Number(seconds) / 60));
        let hours: string = '';

        if (Number(minutes) > 59) {
            hours = DateTimeAPIUtil.padZero(Math.floor(Number(minutes) / 60));
            minutes = DateTimeAPIUtil.padZero((Number(minutes) - (Number(hours) * 60)));
        }
        seconds = DateTimeAPIUtil.padZero(Math.floor(Number(seconds) % 60));

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

    public static async getMonthName(token: string, date: Date, language?: string): Promise<string> {
        if (!language) {
            language = await TranslationAPIService.getUserLanguage(token);
        }
        return date.toLocaleString(language, { month: 'long' });
    }

}
