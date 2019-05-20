import {
    AbstractMarkoComponent, ActionFactory, ContextService, TableFactoryService,
    TableConfiguration, TableHeaderHeight, TableRowHeight, DefaultColumnConfiguration, SearchOperator
} from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';
import { SystemAddressDetailsContext } from '../../../../../core/browser/system-address';
import {
    SystemAddress, KIXObjectType, SystemAddressProperty, FilterCriteria, QueueProperty, FilterDataType, FilterType
} from '../../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

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
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<SystemAddress>());
    }

    private async initWidget(systemAddress: SystemAddress): Promise<void> {
        const columns = [
            new DefaultColumnConfiguration(
                SystemAddressProperty.NAME, true, false, true, false, 250, true, true, false
            ),
            new DefaultColumnConfiguration(
                SystemAddressProperty.COMMENT, true, false, true, false, 250, true, true, false
            ),
            new DefaultColumnConfiguration(SystemAddressProperty.VALID_ID, true, false, true, false, 100, true, true)
        ];
        const filterCriteria =
            [
                new FilterCriteria(
                    QueueProperty.SYSTEM_ADDRESS_ID, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, systemAddress.ID
                ),
            ];

        const tableConfiguration = new TableConfiguration(
            KIXObjectType.QUEUE, null, null, columns, filterCriteria, false, false, null, null,
            TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await await TableFactoryService.getInstance().createTable(
            'system-address-assigned-queues', KIXObjectType.QUEUE, tableConfiguration,
            systemAddress.QueueIDs, null, true,
            undefined, false, true, true
        );
        this.state.table = table;
        this.prepareActions(systemAddress);
        this.prepareTitle(systemAddress);
    }

    private async prepareTitle(systemAddress: SystemAddress): Promise<void> {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        title = await TranslationService.translate(title);
        const count = systemAddress.QueueIDs ? systemAddress.QueueIDs.length : 0;
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
