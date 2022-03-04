/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { PortalNotification } from '../../../model/PortalNotification';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const notifications: PortalNotification[] = input.notifications || [];

        const groupedNotifications: Array<[string, PortalNotification[]]> = [];
        for (const n of notifications) {
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

    public async onMount(): Promise<void> {
        return;
    }

}

module.exports = Component;