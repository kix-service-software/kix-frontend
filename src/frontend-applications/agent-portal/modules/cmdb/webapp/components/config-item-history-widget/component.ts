/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ConfigItem } from '../../../model/ConfigItem';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';


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
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        this.context?.registerListener('config-item-history-widget', {
            sidebarLeftToggled: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (configItemId: string, configItem: ConfigItem, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM) {
                    this.initWidget(configItem);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });

        await this.initWidget(await this.context?.getObject<ConfigItem>());
    }

    private async initWidget(configItem: ConfigItem): Promise<void> {
        if (configItem) {
            this.prepareActions(configItem);
            await this.prepareTable();
        }
    }

    private async prepareActions(configItem: ConfigItem): Promise<void> {
        if (this.state.widgetConfiguration && configItem) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [configItem], this.contextInstanceId
            );
        }
    }

    private async prepareTable(): Promise<void> {
        const table = await TableFactoryService.getInstance().createTable(
            'config-item-history', KIXObjectType.CONFIG_ITEM_HISTORY, null, null, this.contextInstanceId
        );

        this.state.table = table;
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }

    // private navigateToVersion(historyEntry: ConfigItemHistory, columnId: string): void {
    //     if (columnId === 'Content' && historyEntry.VersionID) {
    //         EventService.getInstance().publish('GotToConfigItemVersion', historyEntry.VersionID);
    //     }
    // }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
