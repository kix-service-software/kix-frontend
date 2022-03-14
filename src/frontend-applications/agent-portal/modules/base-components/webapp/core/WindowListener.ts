/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class WindowListener {

    private static INSTANCE: WindowListener;

    public static getInstance(): WindowListener {
        if (!WindowListener.INSTANCE) {
            WindowListener.INSTANCE = new WindowListener();
        }
        return WindowListener.INSTANCE;
    }

    private constructor() {
        window.addEventListener('beforeunload', this.beforeunload.bind(this), { capture: true });
    }

    public removeBrowserListener(): void {
        window.removeEventListener('beforeunload', this.beforeunload.bind(this), { capture: true });
    }

    private beforeunload(event: any): any {
        event.preventDefault();
        event.returnValue = '';
    }

    public logout(): void {
        this.removeBrowserListener();
        window.onbeforeunload = (): void => null;
        window.location.replace('/auth');
    }

}