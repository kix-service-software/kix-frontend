export class DateTimeUtil {

    public static getLocalDateString(value: any, locale: string = 'de-DE', weekday: boolean = false): string {
        let string = '';
        if (value) {
            const date = new Date(value);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            };
            if (weekday) {
                options['weekday'] = 'long';
            }
            string = date.toLocaleDateString(locale, options);
        }
        return string;
    }

    public static getLocalDateTimeString(value: any, locale: string = 'de-DE', weekday: boolean = false): string {
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
            if (weekday) {
                options['weekday'] = 'long';
            }
            string = date.toLocaleString(locale, options);
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

    private static padZero(value: number): string {
        return (value < 10 ? '0' + value : value).toString();
    }
}
