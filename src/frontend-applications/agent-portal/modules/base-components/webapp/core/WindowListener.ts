/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class WindowListener {

    private static INSTANCE: WindowListener;
    private listenerAdded: boolean = false;

    public static getInstance(): WindowListener {
        if (!WindowListener.INSTANCE) {
            WindowListener.INSTANCE = new WindowListener();
        }
        return WindowListener.INSTANCE;
    }

    public addBrowserListener(): void {
        if (!this.listenerAdded) {
            // WARNING: don't bind "this" on listener function because then it will not be same for remove
            // even if this bind is used for remove, too
            window.addEventListener('beforeunload', this.beforeunload, true);
            this.listenerAdded = true;
        }
    }

    public removeBrowserListener(): void {
        window.removeEventListener('beforeunload', this.beforeunload, true);
        this.listenerAdded = false;
    }

    private beforeunload(event: any): any {
        event.preventDefault();
        event.returnValue = '';
    }

    public logout(): void {
        window.location.replace('/auth/logout');
    }

}