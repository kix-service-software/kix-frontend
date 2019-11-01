/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    AbstractMarkoComponent, ActionFactory, ContextService, TableFactoryService,
    TableConfiguration, TableHeaderHeight, TableRowHeight, DefaultColumnConfiguration, SearchOperator,
    TableEvent, TableEventData
} from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';
import { SystemAddressDetailsContext } from '../../../../../core/browser/system-address';
import {
    SystemAddress, KIXObjectType, FilterCriteria, QueueProperty, FilterDataType,
    FilterType, KIXObjectProperty, KIXObjectLoadingOptions
} from '../../../../../core/model';
import { IEventSubscriber, EventService } from '../../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<SystemAddressDetailsContext>(
            SystemAddressDetailsContext.CONTEXT_ID
        );

        context.registerListener('system-address-assigned-queues-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (systemAddressId: string, systemAddress: SystemAddress, type: KIXObjectType) => {
                if (type === KIXObjectType.SYSTEM_ADDRESS) {
                    this.initWidget(systemAddress);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<SystemAddress>());
    }

    public async onDestroy(): Promise<void> {
        const context = await ContextService.getInstance().getContext<SystemAddressDetailsContext>(
            SystemAddressDetailsContext.CONTEXT_ID
        );
        if (context) {
            context.unregisterListener('system-address-assigned-queues-widget');
        }
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.subscriber);
        TableFactoryService.getInstance().destroyTable('system-address-assigned-queues');
    }

    private async initWidget(systemAddress: SystemAddress): Promise<void> {
        const columns = [
            new DefaultColumnConfiguration(null, null, null,
                QueueProperty.NAME, true, false, true, false, 250, true, true, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                QueueProperty.COMMENT, true, false, true, false, 350, true, true, false
            ),
            new DefaultColumnConfiguration(
                null, null, null, KIXObjectProperty.VALID_ID, true, false, true, false, 150, true, true
            )
        ];

        const filter =
            [
                new FilterCriteria(
                    QueueProperty.SYSTEM_ADDRESS_ID, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, systemAddress.ID
                ),
            ];
        const loadingOptions = new KIXObjectLoadingOptions(filter);

        const tableConfiguration = new TableConfiguration(null, null, null,
            KIXObjectType.QUEUE, loadingOptions, null, columns, [], false, false, null, null,
            TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            'system-address-assigned-queues', KIXObjectType.QUEUE, tableConfiguration,
            undefined, null, true,
            undefined, false, true, true
        );
        this.state.title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";

        this.subscriber = {
            eventSubscriberId: 'system-address-assigned-queues-widget',
            eventPublished: async (data: TableEventData, eventId: string) => {
                if (this.state.table && data && data.tableId === this.state.table.getTableId()) {
                    if (eventId === TableEvent.TABLE_INITIALIZED) {
                        await this.prepareTitle();
                    }
                }
            }
        };
        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.subscriber);

        this.state.table = table;
        this.prepareActions(systemAddress);
    }

    private async prepareTitle(): Promise<void> {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";

        title = await TranslationService.translate(title);

        let count = 0;
        if (this.state.table) {
            await this.state.table.initialize();
            count = this.state.table.getRowCount(true);
        }
        this.state.title = `${title} (${count})`;
    }

    private async prepareActions(systemAddress: SystemAddress): Promise<void> {
        if (this.state.widgetConfiguration && systemAddress) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [systemAddress]
            );
        }
    }

}

module.exports = Component;
