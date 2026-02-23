/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BackendNotification } from '../../../../model/BackendNotification';
import { IdService } from '../../../../model/IdService';
import { PersonalSettingsProperty } from '../../../user/model/PersonalSettingsProperty';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { Context } from '../../../../model/Context';
import { ApplicationEvent } from './ApplicationEvent';
import { ContextEvents } from './ContextEvents';
import { EventService } from './EventService';
import { IEventSubscriber } from './IEventSubscriber';
import { ContextService } from './ContextService';

export class ContextRefreshInterval {

    private autoUpdateTime: number;
    private notificationSubscriber: IEventSubscriber;
    private contextSubscriber: IEventSubscriber;

    private isBrowserTabActive: boolean = true;
    private updateAllowed: boolean = false;
    private updateRequired: boolean = false;
    private updateTimeout: any;

    private eventSubscriberId: string;
    private userId: number;

    public constructor() {
        document.addEventListener('visibilitychange', () => {
            // update state of active browser tab
            this.isBrowserTabActive = !document.hidden;

            this.refreshContent();
        });
    }

    public async initialize(): Promise<void> {
        if (!this.userId) {
            const user = await AgentService.getInstance().getCurrentUser();
            this.userId = user?.UserID;
        }

        if (!this.eventSubscriberId) {
            this.eventSubscriberId = IdService.generateDateBasedId('ContextRefreshInterval');

            this.notificationSubscriber = {
                eventSubscriberId: this.eventSubscriberId,
                eventPublished: function (data: BackendNotification, eventId: string): void {
                    if (eventId === ApplicationEvent.OBJECT_UPDATED) {
                        const isNamespace = data.Namespace === 'User.UserPreference';
                        const isObjectId = data.ObjectID === `${this.userId}::${PersonalSettingsProperty.AGENT_PORTAL_DASHBOARD_REFRESH_INTERVAL}`;
                        if (isNamespace && isObjectId) {
                            this.initAutoUpdate();
                        }
                    }
                }.bind(this)
            };
            EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.notificationSubscriber);

            this.contextSubscriber = {
                eventSubscriberId: this.eventSubscriberId,
                eventPublished: function (data: Context, eventId: string): void {
                    if (eventId === ApplicationEvent.REFRESH_CONTENT) {
                        this.resetAutoUpdate();
                    }
                    else if (
                        eventId === ContextEvents.CONTEXT_UPDATE_REQUIRED
                        && data?.instanceId === ContextService.getInstance().getActiveContext().instanceId
                    ) {
                        this.updateRequired = true;

                        this.refreshContent();
                    }
                }.bind(this)
            };
            EventService.getInstance().subscribe(ApplicationEvent.REFRESH_CONTENT, this.contextSubscriber);
            EventService.getInstance().subscribe(ContextEvents.CONTEXT_UPDATE_REQUIRED, this.contextSubscriber);
        }

        this.initAutoUpdate();
    }

    private async initAutoUpdate(): Promise<void> {
        const refreshIntervalPref = await AgentService.getInstance().getUserPreference(
            PersonalSettingsProperty.AGENT_PORTAL_DASHBOARD_REFRESH_INTERVAL
        );
        this.autoUpdateTime = Number(refreshIntervalPref?.Value);
        if (!isNaN(this.autoUpdateTime) && this.autoUpdateTime > 0) {
            this.autoUpdateTime = this.autoUpdateTime * 60 * 1000;
        }
        else {
            this.autoUpdateTime = 0;
        }

        this.resetAutoUpdate();
    }

    // Context is switched by user
    public resetAutoUpdate(): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        this.updateAllowed = false;
        this.updateRequired = false;

        if (this.autoUpdateTime > 0) {
            this.updateTimeout = setTimeout(() => this.handleTimeout(), this.autoUpdateTime);
        }
    }

    // update notification recieved
    public handleNotification(): void {
        this.updateRequired = true;

        this.refreshContent();
    }

    public handleTimeout(): void {
        this.updateAllowed = true;

        this.refreshContent();
    }

    private refreshContent(): void {
        if (
            this.isBrowserTabActive
            && this.updateAllowed
            && this.updateRequired
        ) {
            EventService.getInstance().publish(
                ApplicationEvent.REFRESH_CONTENT, ContextService.getInstance().getActiveContext().instanceId
            );
        }
    }

}