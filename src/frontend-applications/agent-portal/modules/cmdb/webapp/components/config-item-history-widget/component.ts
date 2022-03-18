/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ConfigItemDetailsContext } from '../../core';
import { ConfigItem } from '../../../model/ConfigItem';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';


class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
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

        context.registerListener('config-item-history-widget', {
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

        await this.initWidget(await context.getObject<ConfigItem>());
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
                this.state.widgetConfiguration.actions, [configItem]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        const table = await TableFactoryService.getInstance().createTable(
            'config-item-history', KIXObjectType.CONFIG_ITEM_HISTORY, null, null, ConfigItemDetailsContext.CONTEXT_ID
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

}

module.exports = Component;
