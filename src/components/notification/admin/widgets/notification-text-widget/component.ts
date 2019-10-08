/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    AbstractMarkoComponent, ActionFactory, ContextService, IdService, Label, WidgetService
} from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, Notification, ContextType, ObjectInformationWidgetSettings, NotificationProperty, WidgetType
} from '../../../../../core/model';
import { NotificationLabelProvider } from '../../../../../core/browser/notification';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextListenerId: string;
    private labels: Map<string, Label[]>;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('notification-message-group', WidgetType.GROUP);
        this.state.labelProvider = new NotificationLabelProvider();
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.contextListenerId = IdService.generateDateBasedId('notification-text-widget');

        context.registerListener(this.contextListenerId, {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, notification: Notification, type: KIXObjectType) => {
                if (type === KIXObjectType.NOTIFICATION) {
                    this.initWidget(notification);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<Notification>());
    }

    public onDestroy() {
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        context.unregisterListener(this.contextListenerId);
    }

    private async initWidget(notification: Notification): Promise<void> {
        this.state.notification = null;

        setTimeout(() => {
            this.state.notification = notification;
            this.prepareMessageGroups();
            this.prepareActions();
        }, 10);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.notification) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.notification]
            );
        }
    }

    private prepareMessageGroups(): void {
        this.state.messageGroups = [];
        if (this.state.notification && this.state.notification.Message) {
            for (const lang in this.state.notification.Message) {
                if (lang) {
                    const message = this.state.notification.Message[lang];
                    if (message) {
                        this.state.messageGroups.push([lang, message]);
                    }
                }
            }
        }
    }
}

module.exports = Component;
