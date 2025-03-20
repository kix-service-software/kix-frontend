/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import md5 from 'md5';

export class ClientStorageService {

    public static tokenPrefix = '';

    public static setSocketTimeout(timeout: number): void {
        if (!isNaN(timeout)) {
            this.setOption('SocketTimeout', timeout.toString());
        }
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
                socketUrl = this.getApplicationUrl();
            }
        }

        return socketUrl;
    }

    public static getApplicationUrl(): string {
        // use current location as socket URL
        let applicationUrl = window.location.protocol + '//' + window.location.hostname;

        const port = window.location.port;
        if (port) {
            applicationUrl = applicationUrl + ':' + port;
        }

        return applicationUrl;
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
            const serializedState = window.localStorage.getItem(id);
            return serializedState ? JSON.parse(serializedState) : undefined;
        } catch (err) {
            return undefined;
        }
    }

    public static saveState<T>(id: string, state: T): void {
        try {
            const serializedState = JSON.stringify(state);
            window.localStorage.setItem(id, serializedState);
        } catch (error) {
            console.error(error);
        }
    }

    public static deleteState(id: string): void {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(id);
        }
    }

    public static setOption(key: string, value: string): void {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
        }
    }

    public static getOption(key: string): string {
        if (typeof window !== 'undefined') {
            return window.localStorage.getItem(key);
        }
        return null;
    }

    public static getAllKeys(startsWith?: string): string[] {
        const keys: string[] = [];
        Object.keys(window.localStorage).forEach((key) => {
            if (!startsWith?.length) {
                keys.push(key);
            } else if (key.startsWith(startsWith)) {
                keys.push(key);
            }
        });
        return keys;
    }

    private static clientRequestId: string;

    public static getClientRequestId(): string {
        if (typeof window !== 'undefined') {
            if (!this.clientRequestId) {
                this.clientRequestId = md5(window.navigator.userAgent + Date.now());
            }
        }
        return this.clientRequestId;
    }

}
