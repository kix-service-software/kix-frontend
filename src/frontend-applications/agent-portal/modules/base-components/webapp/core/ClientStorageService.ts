/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import md5 from 'md5';
import { ReleaseInfo } from '../../../../model/ReleaseInfo';

export class ClientStorageService {

    private static clientRequestId: string;

    private static _application: string;

    public static set application(application: string) {
        this._application = application;
    }

    public static get application(): string {
        return this._application;
    }

    public static setApplicationData(data: any): void {
        const { baseRoute, mainMenu, releaseInfo, application } = data;
        this.application = application;
        this.setOption('BASE_ROUTE', baseRoute || '');

        if (mainMenu) {
            this.setOrUpdateObjectValue('MainMenu', mainMenu);
        }

        if (releaseInfo) {
            this.setOrUpdateObjectValue('ReleaseInfo', releaseInfo);
        }
    }

    private static setOrUpdateObjectValue(option: string, obj: any): void {
        const objString = JSON.stringify(obj);
        const objOption = ClientStorageService.getOption(option);
        if (objOption !== objString) {
            ClientStorageService.setOption(option, objString);
        }
    }

    public static getReleaseInfo(): ReleaseInfo {
        return this.getObjectValue('ReleaseInfo');
    }

    private static getObjectValue(option: string): any {
        const objOption = ClientStorageService.getOption(option);
        let obj;
        try {
            obj = JSON.parse(objOption);
        } catch (e) {

        }

        return obj;
    }

    public static getBaseRoute(): string {
        return this.getOption('BASE_ROUTE') || '';
    }

    public static getSocketTimeout(): number {
        let timeout = 30000;
        const option = this.getOption('SocketTimeout');
        if (option) {
            timeout = Number(option);
        }

        return timeout;
    }

    public static getFrontendSocketUrl(): string {
        let socketUrl;
        if (typeof window !== 'undefined') {
            socketUrl = ClientStorageService.getCookie('frontendSocketUrl');

            if (!socketUrl || socketUrl === '') {
                socketUrl = this.getApplicationUrl(true);
            }
        }

        return socketUrl;
    }

    public static getApplicationUrl(hostOnly?: boolean): string {
        // use current location as socket URL
        let applicationUrl = window.location.protocol + '//' + window.location.hostname;

        const port = window.location.port;
        if (port) {
            applicationUrl = applicationUrl + ':' + port;
        }

        const baseRoute = hostOnly ? '' : ClientStorageService.getBaseRoute();
        return `${applicationUrl}${baseRoute}`;
    }

    public static getCookie(name: string): string {
        if (typeof document !== 'undefined') {
            const nameEQ = name + '=';
            const ca = decodeURIComponent(document.cookie).split(';');
            for (let c of ca) {
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
        }
        return null;
    }

    public static loadState<T>(id: string): T {
        try {
            const serializedState = window.localStorage.getItem(
                id.startsWith(`${this.application}-`) ? id : `${this.application}-${id}`
            );
            return serializedState ? JSON.parse(serializedState) : undefined;
        } catch (err) {
            return undefined;
        }
    }

    public static saveState<T>(id: string, state: T): void {
        try {
            const serializedState = JSON.stringify(state);
            window.localStorage.setItem(
                id.startsWith(`${this.application}-`) ? id : `${this.application}-${id}`,
                serializedState
            );
        } catch (error) {
            console.error(error);
        }
    }

    public static deleteState(id: string): void {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(
                id.startsWith(`${this.application}-`) ? id : `${this.application}-${id}`
            );
        }
    }

    public static setOption(key: string, value: string): void {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(
                key.startsWith(`${this.application}-`) ? key : `${this.application}-${key}`,
                value
            );
        }
    }

    public static getOption(key: string): string {
        if (typeof window !== 'undefined') {
            return window.localStorage.getItem(
                key.startsWith(`${this.application}-`) ? key : `${this.application}-${key}`
            );
        }
        return null;
    }

    public static getAllKeys(startsWith?: string): string[] {
        const keys: string[] = [];
        Object.keys(window.localStorage).forEach((key) => {
            if (!startsWith?.length) {
                keys.push(key);
            } else if (key.startsWith(`${this.application}-${startsWith}`) || key.startsWith(startsWith)) {
                keys.push(key);
            }
        });
        return keys.map((k) => k.substring(`${this.application}-`.length));
    }

    public static initClientRequestId(): void {
        if (!this.clientRequestId && (typeof window !== 'undefined')) {
            const values = [
                window.navigator.userAgent,
                window.navigator.platform,
                window.navigator.language,
                window.navigator.product,
                window.navigator.productSub,
                window.navigator.vendor,
                window.navigator.appCodeName,
                window.navigator.appName
            ];

            this.clientRequestId = md5(values.join('-'));
            document.cookie = `${this.application}-clientRequestId=${this.clientRequestId}`;
        }
    }

    public static checkLocalStorage(): void {
        const totalSizeMB = this.getLocalStorageSize();
        console.log(`Size of Local Storage: ${totalSizeMB} MB`);

        if (totalSizeMB > 4) {
            this.clearLocalStorage();
        }
    }

    public static clearLocalStorage(): void {
        console.log('Clear local storage');
        const keys = [
            '.*OBJECT_SEARCH.*',
            '.*-activetab',
            '.*-minimized',
            '.*-scrollpos',
            '.*opened-sidebar.*',
            '.*i18n-translations'
        ];
        for (const key in window.localStorage) {
            if (key.match(keys.join('|'))?.length) {
                window.localStorage.removeItem(key);
            }
        }

        const totalSizeMB = this.getLocalStorageSize();
        console.log(`Size of Local Storage: ${totalSizeMB} MB`);
    }

    public static getLocalStorageSize(): number {
        let totalSize = 0;

        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const keySize = new Blob([key]).size; // Size of the key
                const valueSize = new Blob([localStorage[key]]).size; // Size of the value
                totalSize += keySize + valueSize;
            }
        }

        return Number((totalSize / (1024 * 1024)).toFixed(2));
    }

}
