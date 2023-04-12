/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class TimeoutTimer {

    private timer = null;

    private startTimer(callback: () => void, timeout: number = 300): void {
        this.timer = setTimeout(() => {
            callback();
            clearTimeout(this.timer);
        }, timeout);
    }

    public restartTimer(callback: () => void, timeout: number = 300): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
            this.startTimer(callback, timeout);
        } else {
            this.startTimer(callback, timeout);
        }
    }
}