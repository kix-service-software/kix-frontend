/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { IdService } from '../../../../../model/IdService';
import { MailAccount } from '../../../model/MailAccount';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ObjectInformationWidgetConfiguration } from '../../../../../model/configuration/ObjectInformationWidgetConfiguration';
import { MailAccountProperty } from '../../../model/MailAccountProperty';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { DispatchingType } from '../../../model/DispatchingType';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../model/ContextMode';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.contextListenerId = IdService.generateDateBasedId('mail-account-info-widget-');
        context.registerListener(this.contextListenerId, {
            sidebarLeftToggled: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (accountId: string, mailAccount: MailAccount, type: KIXObjectType) => {
                this.initWidget(mailAccount);
            },
            additionalInformationChanged: (): void => { return; }
        });

        this.initWidget(await context.getObject<MailAccount>(KIXObjectType.MAIL_ACCOUNT));
    }

    public onDestroy(): void {
        const context = ContextService.getInstance().getActiveContext();
        context.unregisterListener(this.contextListenerId);
    }

    private initWidget(mailAccount: MailAccount): void {
        this.state.account = null;
        const settings = this.state.widgetConfiguration.configuration as ObjectInformationWidgetConfiguration;
        if (settings && Array.isArray(settings.properties)) {
            this.state.properties = [...settings.properties];
        }

        setTimeout(() => {
            if (Array.isArray(this.state.properties) && mailAccount && !mailAccount.Type.match(/^IMAP/)) {
                this.state.properties = this.state.properties.filter((p) => p !== MailAccountProperty.IMAP_FOLDER);
            }
            this.state.account = mailAccount;
            this.setDispatchingRoutingConfiguration();
            this.prepareActions();
        }, 10);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.account) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.account]
            );
        }
    }

    private async setDispatchingRoutingConfiguration(): Promise<void> {
        if (
            this.state.account && this.state.account.DispatchingBy === DispatchingType.BACKEND_KEY_QUEUE
            && this.state.account.QueueID
        ) {
            this.state.routingConfigurations = [
                [
                    MailAccountProperty.DISPATCHING_BY,
                    new RoutingConfiguration(
                        'ticket-queue-details', KIXObjectType.QUEUE,
                        ContextMode.DETAILS, 'QueueID', false, false,
                        this.state.account.QueueID
                    )
                ]
            ];
        }
    }
}

module.exports = Component;
