import { AuthenticationService, UserService } from "../../services";
import { AgentService } from "../../browser/application/AgentService";
import { TranslationService } from "../../browser/i18n/TranslationService";

export class DateTimeUtil {

    public static async getLocalDateString(value: any): Promise<string> {
        let string = '';
        if (value) {
            const date = new Date(value);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            };
            const userLanguage = await TranslationService.getUserLanguage();
            string = date.toLocaleDateString(userLanguage, options);
        }
        return string;
    }

    public static async getLocalDateTimeString(value: any): Promise<string> {
        let string = '';
        if (value) {
            const date = new Date(value);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };

            const userLanguage = await TranslationService.getUserLanguage();
            string = date.toLocaleString(userLanguage, options);
        }
        return string;
    }

    public static calculateAge(ageInMillisends: number): string {
        let ageResult = ageInMillisends + 'ms';

        const hoursInSeconds = 60 * 60;
        const daysInSeconds = 24 * hoursInSeconds;

        const days = Math.floor(ageInMillisends / daysInSeconds);
        const hours = Math.floor((ageInMillisends - (days * daysInSeconds)) / hoursInSeconds);
        const minutes = Math.round((ageInMillisends - (days * daysInSeconds) - (hours * hoursInSeconds)) / 60);

        if (days === 0) {
            ageResult = hours + 'h ' + minutes + 'm';
        } else {
            ageResult = days + 'd ' + hours + 'h';
        }

        return ageResult;
    }

    public static getKIXDateTimeString(date: Date): string {
        return `${DateTimeUtil.getKIXDateString(date)} ${DateTimeUtil.getKIXTimeString(date, false)}`;
    }

    public static getKIXDateString(date: Date): string {
        const year = date.getFullYear();
        const month = DateTimeUtil.padZero(date.getMonth() + 1);
        const day = DateTimeUtil.padZero(date.getDate());
        const kixDateString = `${year}-${month}-${day}`;
        return kixDateString;
    }

    public static getKIXTimeString(date: Date, short: boolean = true): string {
        const hours = DateTimeUtil.padZero(date.getHours());
        const minutes = DateTimeUtil.padZero(date.getMinutes());
        const seconds = DateTimeUtil.padZero(date.getSeconds());
        let kixTimeString = `${hours}:${minutes}`;
        if (!short) {
            kixTimeString += `:${seconds}`;
        }
        return kixTimeString;
    }

    public static sameDay(d1: Date, d2: Date): boolean {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
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

    private static padZero(value: number): string {
        return (value < 10 ? '0' + value : value).toString();
    }

}
