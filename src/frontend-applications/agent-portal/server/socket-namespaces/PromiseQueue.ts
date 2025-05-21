/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { User } from '../../modules/user/model/User';

export class PromiseQueue {

    private static INSTANCE: PromiseQueue;

    public static getInstance(): PromiseQueue {
        if (!PromiseQueue.INSTANCE) {
            PromiseQueue.INSTANCE = new PromiseQueue();
        }
        return PromiseQueue.INSTANCE;
    }

    private constructor() { }

    private queue = [];
    private promiseRunning: boolean = false;

    public enqueue(promiseCallback: (user: User, data: any) => Promise<any>, parameter: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                promise: promiseCallback,
                parameter,
                resolve,
                reject,
            });

            this.dequeue();
        });
    }

    public dequeue(): void {
        if (this.promiseRunning) {
            return;
        }

        if (!this.queue.length) {
            this.promiseRunning = false;
            return;
        }

        this.promiseRunning = true;

        const item = this.queue.shift();
        if (!item) {
            return;
        }

        try {
            item.promise(...item.parameter).then((value) => {
                item.resolve(value);
                this.promiseRunning = false;
                this.dequeue();
            }).catch((err) => {
                this.promiseRunning = false;
                item.reject(err);
                this.dequeue();
            });
        } catch (err) {
            this.promiseRunning = false;
            item.reject(err);
            this.dequeue();
        }
    }
}