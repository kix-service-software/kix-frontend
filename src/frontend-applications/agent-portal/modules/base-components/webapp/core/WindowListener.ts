/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ClientStorageService } from './ClientStorageService';

export class WindowListener {

    private static INSTANCE: WindowListener;
    private listenerAdded: boolean = false;

    private unloadTasks: Map<string, () => any> = new Map();

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
            window.addEventListener('unload', this.unload, true);
            this.listenerAdded = true;
        }
    }

    public removeBrowserListener(): void {
        window.removeEventListener('beforeunload', this.beforeunload, true);
        window.removeEventListener('unload', this.unload, true);
        this.listenerAdded = false;
    }

    private beforeunload(event: any): any {
        event.preventDefault();
        event.returnValue = '';
    }

    private unload(event: any): any {
        const tasks = WindowListener.getInstance().getUnloadTasks();
        if (tasks.size) {
            tasks.forEach((task) => {
                task();
            });
        }
    }

    public logout(): void {
        const baseRoute = ClientStorageService.getBaseRoute();
        window.location.replace(`${baseRoute}/auth/logout`);
    }

    public addUnloadTask(taskName: string, task: () => any): void {
        this.unloadTasks.set(taskName, task);
    }

    public removeUnloadTask(taskName: string): void {
        if (this.unloadTasks.has(taskName)) {
            this.unloadTasks.delete(taskName);
        }
    }

    public getUnloadTasks(): Map<string, () => any> {
        return this.unloadTasks;
    }

}