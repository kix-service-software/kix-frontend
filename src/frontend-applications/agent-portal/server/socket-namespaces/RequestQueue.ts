/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LoggingService } from '../../../../server/services/LoggingService';
import { ProfilingService } from '../../../../server/services/ProfilingService';

export class RequestQueue {

    private static INSTANCE: RequestQueue;

    public static getInstance(): RequestQueue {
        if (!RequestQueue.INSTANCE) {
            RequestQueue.INSTANCE = new RequestQueue();
        }
        return RequestQueue.INSTANCE;
    }

    private constructor() { }

    private queue = [];
    private requestRunning: boolean = false;

    public enqueue(promise: Promise<any>, profileTaskId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                promise,
                profileTaskId,
                resolve,
                reject,
            });

            this.dequeue();
        });
    }

    public dequeue(): void {
        if (this.requestRunning) {
            return;
        }

        const item = this.queue.shift();
        if (!item) {
            return;
        }

        try {
            this.requestRunning = true;

            ProfilingService.getInstance().logStart(item.profileTaskId);
            LoggingService.getInstance().debug(`Socket Queue Length: ${this.queue.length}`);

            item.promise.then((value) => {
                item.resolve(value);
                this.requestRunning = false;
                this.dequeue();
            }).catch((err) => {
                this.requestRunning = false;
                item.reject(err);
                this.dequeue();
            });
        } catch (err) {
            this.requestRunning = false;
            item.reject(err);
            this.dequeue();
        }
    }
}