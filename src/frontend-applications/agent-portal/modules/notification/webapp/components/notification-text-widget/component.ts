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

import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { NotificationLabelProvider } from '../../core';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { Notification } from '../../../model/Notification';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('notification-message-group', WidgetType.GROUP);
        this.state.labelProvider = new NotificationLabelProvider();
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;
        this.contextListenerId = IdService.generateDateBasedId('notification-text-widget');

        context.registerListener(this.contextListenerId, {
            sidebarRightToggled: () => { return; },
            sidebarLeftToggled: () => { return; },
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
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        await this.initWidget(await context.getObject<Notification>());
    }

    public onDestroy() {
        const context = ContextService.getInstance().getActiveContext();
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

    private async prepareMessageGroups(): Promise<void> {
        this.state.messageGroups = [];
        if (this.state.notification && this.state.notification.Message) {
            const languages = await TranslationService.getInstance().getLanguages();
            const languageHash: { [x: string]: string; } = {};
            languages.forEach((a) => languageHash[a[0]] = a[1]);
            for (const lang in this.state.notification.Message) {
                if (lang) {
                    const message = this.state.notification.Message[lang];
                    if (message) {
                        this.state.messageGroups.push([languageHash[lang], message]);
                    }
                }
            }

            (this as any).setStateDirty('messageGroups');
        }
    }
}

module.exports = Component;
