/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class RequestCounter {

    private static INSTANCE: RequestCounter;

    public static getInstance(): RequestCounter {
        if (!RequestCounter.INSTANCE) {
            RequestCounter.INSTANCE = new RequestCounter();
        }
        return RequestCounter.INSTANCE;
    }

    private constructor() { }

    private totalSocketRequests: number = 0;
    private pendingSocketRequestCount: number = 0;

    private totalHTTPRequests: number = 0;
    private pendingHttpRequestCount: number = 0;

    public incrementTotalSocketRequestCount(): void {
        this.totalSocketRequests++;
    }

    public getPendingSocketRequestCount(): number {
        return this.pendingSocketRequestCount;
    }

    public countSocketRequestCounter(increment: boolean = true): void {
        if (increment) {
            this.pendingSocketRequestCount++;
        } else {
            this.pendingSocketRequestCount--;
        }
    }

    public getPendingHTTPRequestCount(): number {
        return this.pendingHttpRequestCount;
    }

    public setPendingHTTPRequestCount(count: number, incrementTotal?: boolean): void {
        this.pendingHttpRequestCount = count;
        if (incrementTotal) {
            this.totalHTTPRequests++;
        }
    }

    public getTotalSocketRequestCount(): number {
        return this.totalSocketRequests;
    }

    public getTotalHttpRequestCount(): number {
        return this.totalHTTPRequests;
    }
}