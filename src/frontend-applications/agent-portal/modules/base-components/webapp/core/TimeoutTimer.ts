/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class TimeoutTimer {

    private timer = null;

    private startTimer(callback: () => void, timeout: number = 300): Promise<void> {
        return new Promise<void>((resolve) => {
            this.timer = setTimeout(() => {
                callback();
                clearTimeout(this.timer);
                resolve();
            }, timeout);
        });
    }

    public restartTimer(callback: () => void, timeout: number = 300): Promise<void> {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
            return this.startTimer(callback, timeout);
        } else {
            return this.startTimer(callback, timeout);
        }
    }
}