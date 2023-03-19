/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { KanbanContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { KanbanConfiguration } from './webapp/core/KanbanConfiguration';
import { TicketProperty } from '../ticket/model/TicketProperty';
import { KanbanColumn } from './webapp/core/KanbanColumn';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return KanbanContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const kanbanConfig = new KanbanConfiguration(
            'personal-kanban-config', 'personal-kanban', ConfigurationType.Kanban,
            [
                TicketProperty.CONTACT_ID,
                TicketProperty.STATE_ID,
                TicketProperty.QUEUE_ID,
                TicketProperty.RESPONSIBLE_ID,
                TicketProperty.CHANGED
            ],
            [
                new KanbanColumn('team-backlog', 'new'),
                new KanbanColumn('personal-backlog', 'new'),
                new KanbanColumn('wip', 'open'),
                new KanbanColumn('pending', 'pending reminder'),
                new KanbanColumn('closed', 'closed')
            ]
        );

        configurations.push(
            new WidgetConfiguration(
                'kanban-main-widget', 'KANBAN Widget', ConfigurationType.Widget,
                'kanban-widget', 'My KANBAN Widget', [], null, kanbanConfig
            )
        );

        configurations.push(new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [],
            [], [],
            [
                new ConfiguredWidget('kanban-main-widget', 'kanban-main-widget')
            ], [],
        ));

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
