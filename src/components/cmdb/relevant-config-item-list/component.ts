/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService, KIXObjectService } from '../../../core/browser';
import {
    KIXObjectType, ConfigItem, KIXObjectLoadingOptions, ContextMode, ConfigItemProperty, ContextType, Ticket
} from '../../../core/model';
import { RoutingConfiguration } from '../../../core/browser/router';
import { ConfigItemDetailsContext } from '../../../core/browser/cmdb';
import { TicketDetailsContext } from '../../../core/browser/ticket';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );

        context.registerListener('relevant-config-item-list', {
            additionalInformationChanged: () => { return; },
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: async () => {
                this.updateConfigItems();
            },
        });

        this.updateConfigItems();
    }

    private async updateConfigItems(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );
        const ticket = await context.getObject();
        if (ticket) {
            const linkedConfigItemIds = ticket.Links.filter(
                (l) => l.Type === 'RelevantTo' && l.SourceObject === KIXObjectType.CONFIG_ITEM
            ).map((l) => l.SourceKey);

            if (linkedConfigItemIds && linkedConfigItemIds.length) {
                const loadingOptions = new KIXObjectLoadingOptions(null, null, null, ['CurrentVersion']);

                const configItems = await KIXObjectService.loadObjects<ConfigItem>(
                    KIXObjectType.CONFIG_ITEM, linkedConfigItemIds, loadingOptions
                );

                configItems.sort(
                    (a, b) => {
                        const aName = a.CurrentVersion ? a.CurrentVersion.Name : '';
                        const bName = b.CurrentVersion ? b.CurrentVersion.Name : '';
                        return (aName.localeCompare(bName));
                    }
                );

                this.state.configItems = configItems;
            } else {
                this.state.configItems = [];
            }
        }
    }

    public getRoutingConfiguration(configItem: ConfigItem): RoutingConfiguration {
        return new RoutingConfiguration(
            ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM,
            ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID
        );
    }

}

module.exports = Component;
