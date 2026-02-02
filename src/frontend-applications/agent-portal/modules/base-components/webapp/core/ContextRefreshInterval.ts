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
import { ContextMode } from '../../../../model/ContextMode';

export class ContextRefreshInterval {

    private notificationSubscriber: IEventSubscriber;
    private contextSubscriber: IEventSubscriber;

    private _isBrowserTabActive: boolean = true;
    private _autoRefreshTime: number = 0;

    private eventSubscriberId: string;
    private userId: number;

    public constructor() {
        document.addEventListener('visibilitychange', () => {
            // update state of active browser tab
            this.isBrowserTabActive = !document.hidden;

            if (this.isBrowserTabActive) {
                const activeContext: Context = ContextService.getInstance().getActiveContext();
                if (activeContext?.descriptor?.contextMode === ContextMode.DASHBOARD) {
                    activeContext.autoRefreshContent();
                }
            }
        });
    }

    public get isBrowserTabActive(): boolean {
        return this._isBrowserTabActive;
    }

    private set isBrowserTabActive(isBrowserTabActive: boolean) {
        this._isBrowserTabActive = isBrowserTabActive;
    }

    public get autoRefreshTime(): number {
        return this._autoRefreshTime;
    }

    private set autoRefreshTime(autoRefreshTime: number) {
        this._autoRefreshTime = autoRefreshTime;
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
                            this.setAutoRefreshTime();
                        }
                    }
                }.bind(this)
            };
            EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.notificationSubscriber);

            this.contextSubscriber = {
                eventSubscriberId: this.eventSubscriberId,
                eventPublished: function (context: Context, eventId: string): void {
                    if (context?.descriptor?.contextMode === ContextMode.DASHBOARD) {
                        if (eventId === ContextEvents.CONTEXT_CREATED) {
                            context.activateAutoRefresh();
                        }
                        else if (eventId === ContextEvents.CONTEXT_CHANGED) {
                            context.autoRefreshContent();
                        }
                    }
                }.bind(this)
            };
            EventService.getInstance().subscribe(ContextEvents.CONTEXT_CREATED, this.contextSubscriber);
            EventService.getInstance().subscribe(ContextEvents.CONTEXT_CHANGED, this.contextSubscriber);

        }

        this.setAutoRefreshTime();
    }

    private async setAutoRefreshTime(): Promise<void> {
        const refreshIntervalPref = await AgentService.getInstance().getUserPreference(
            PersonalSettingsProperty.AGENT_PORTAL_DASHBOARD_REFRESH_INTERVAL
        );
        this.autoRefreshTime = Number(refreshIntervalPref?.Value);
        if (!isNaN(this.autoRefreshTime) && this.autoRefreshTime > 0) {
            this.autoRefreshTime = this.autoRefreshTime * 60 * 1000;
        }
        else {
            this.autoRefreshTime = 0;
        }

        this.resetAutoRefresh();
    }

    private async resetAutoRefresh(): Promise<void> {
        ContextService.getInstance().getContextInstances(null, ContextMode.DASHBOARD).forEach(
            (c) => c.resetAutoRefresh()
        );
    }
}