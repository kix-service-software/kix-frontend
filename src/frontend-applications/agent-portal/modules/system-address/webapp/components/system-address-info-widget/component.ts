/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { SystemAddressLabelProvider } from '../../core';
import { SystemAddress } from '../../../model/SystemAddress';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.labelProvider = new SystemAddressLabelProvider();
        this.context?.registerListener('system-address-info-widget', {
            sidebarRightToggled: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, systemAddress: SystemAddress, type: KIXObjectType) => {
                if (type === KIXObjectType.SYSTEM_ADDRESS) {
                    this.initWidget(systemAddress);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        await this.initWidget(await this.context?.getObject<SystemAddress>());
    }

    private async initWidget(systemAddress: SystemAddress): Promise<void> {
        this.state.systemAddress = systemAddress;
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.systemAddress) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.systemAddress], this.contextInstanceId
            );
        }
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
