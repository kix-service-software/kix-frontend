/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { PortalNotification } from '../../../../../portal-notification/model/PortalNotification';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private notifications: PortalNotification[] = [];
    private expandedNotifications: string[] = [];

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.notifications = input.notifications || [];

        const groupedNotifications: Array<[string, PortalNotification[]]> = [];
        for (const n of this.notifications) {
            let group = groupedNotifications.find((gn) => gn[0] === n.group);
            if (group) {
                group[1].push(n);
            } else {
                group = [n.group, [n]];
                groupedNotifications.push(group);
            }
        }

        this.state.notifications = groupedNotifications;
    }

    public onInput(input: any): void {
        return;
    }

    public async onMount(): Promise<void> {
        this.expandedNotifications = [];
    }

    public toggleNotification(notification: PortalNotification): void {
        const index = this.expandedNotifications?.findIndex((id) => id === notification.id);
        if (index !== -1) {
            this.expandedNotifications?.splice(index, 1);
        } else {
            this.expandedNotifications?.push(notification.id);
        }

        (this as any).setStateDirty('notifications');

        this.state.html = notification.fullText;
    }

    public isExpanded(notification: PortalNotification): boolean {
        return this.expandedNotifications?.some((id) => id.toString() === notification.id);
    }

    public viewLoaded(event: any): void {
        const frameDocument = event.target.contentWindow.document;

        const bodyElements = frameDocument.documentElement.getElementsByTagName('body');
        if (bodyElements?.length) {
            bodyElements[0].addEventListener('click', (event) => {
                BrowserUtil.handleLinkClicked(event);
            });
        }

    }

}

module.exports = Component;