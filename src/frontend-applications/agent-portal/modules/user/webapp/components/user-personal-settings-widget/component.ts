/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { UserLabelProvider } from '../../core/UserLabelProvider';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { User } from '../../../model/User';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { PersonalSettingsProperty } from '../../../model/PersonalSettingsProperty';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Notification } from '../../../../notification/model/Notification';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new UserLabelProvider();
        const context = ContextService.getInstance().getActiveContext();

        context.registerListener('user-personal-settings-widget', {
            sidebarRightToggled: () => { return; },
            sidebarLeftToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, user: User, type: KIXObjectType | string) => {
                if (type === KIXObjectType.USER) {
                    this.initWidget(user);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        await this.initWidget(await context.getObject<User>());
    }

    private async initWidget(user: User): Promise<void> {
        this.state.user = user;
        this.prepareActions(user);
        this.createMyQueuesLabels(user);
        this.createNotificationLabels(user);
    }

    private async prepareActions(user: User): Promise<void> {
        if (this.state.widgetConfiguration && user) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [user]
            );
        }
    }

    private async createMyQueuesLabels(user: User): Promise<void> {
        const myQueues = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.MY_QUEUES);
        if (myQueues && myQueues.Value) {
            const queueIds = Array.isArray(myQueues.Value) ? myQueues.Value :
                myQueues.Value.split(',').map((v) => Number(v));
            const queues = await KIXObjectService.loadObjects('Queue', queueIds);
            this.state.queueLabels = queues.map((q) => new Label(q, null, null, null, null, null, true));
        }
    }

    private async createNotificationLabels(user: User): Promise<void> {
        const notificationsPreference = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.NOTIFICATIONS);
        if (notificationsPreference && notificationsPreference.Value) {
            try {
                const notificationValue = JSON.parse(notificationsPreference.Value);
                const notificationIds = [];
                for (const key in notificationValue) {
                    if (notificationValue[key]) {
                        notificationIds.push(Number(key.split('-')[1]));
                    }
                }
                const notifications = await KIXObjectService.loadObjects<Notification>(
                    KIXObjectType.NOTIFICATION, notificationIds
                );
                this.state.notificationLabels = notifications.map(
                    (n) => new Label(n, null, null, null, null, null, true)
                );
            } catch (e) {
                console.warn('Could not read/parse notification preference value.');
            }
        }
    }

}

module.exports = Component;
