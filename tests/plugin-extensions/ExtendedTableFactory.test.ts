/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable*/
import * as chai from 'chai';
const expect = chai.expect;

import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { TicketTableFactory } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/table/TicketTableFactory';
import { TableConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/TableConfiguration';
import { DefaultColumnConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/DefaultColumnConfiguration';
import { ConfigurationType } from '../../src/frontend-applications/agent-portal/model/configuration/ConfigurationType';
import { ExtendedTableFactory } from '../../src/frontend-applications/agent-portal/modules/table/webapp/core/factory/ExtendedTableFactory';
import { TableFactoryService } from '../../src/frontend-applications/agent-portal/modules/table/webapp/core/factory/TableFactoryService';
import { AgentService } from '../../src/frontend-applications/agent-portal/modules/user/webapp/core/AgentService';
import { User } from '../../src/frontend-applications/agent-portal/modules/user/model/User';

describe('ExtendedTestTableFactory', () => {

    let tableFactory: TicketTableFactory;

    before(() => {
        tableFactory = new TicketTableFactory();
        TableFactoryService.getInstance().registerFactory(tableFactory);
        tableFactory.addExtendedTableFactory(new ExtendedTestTableFactory());

        AgentService.getInstance().getCurrentUser = async (): Promise<User> => new User();
    });

    describe('Create table with empty columns', () => {
        it('Should modify configurations and empty the columns', async () => {
            const table = await tableFactory.createTable(
                'test-table', new TableConfiguration(
                    'test', 'test', ConfigurationType.Table, KIXObjectType.TICKET, null, null,
                    [new DefaultColumnConfiguration('test', 'test', ConfigurationType.TableColumn, 'test')]
                )
            )

            expect(table).exist;
            expect(table.getTableConfiguration()).exist;
            expect(table.getTableConfiguration().tableColumns).an('array');
            expect(table.getTableConfiguration().tableColumns).empty;
        });

        it('Should modify configurations if the standard is used', async () => {
            const table = await tableFactory.createTable('test-table')

            expect(table).exist;
            expect(table.getTableConfiguration()).exist;
            expect(table.getTableConfiguration().tableColumns).an('array');
            expect(table.getTableConfiguration().tableColumns).not.empty;
            expect(table.getTableConfiguration().tableColumns.length).equals(1);
            expect(table.getTableConfiguration().tableColumns[0].id).equals('test');
        });
    });

});

class ExtendedTestTableFactory extends ExtendedTableFactory {

    public async modifiyTableConfiguation(tableConfiguration: TableConfiguration, useDefaultColumns: boolean): Promise<void> {
        tableConfiguration.tableColumns = [];

        if (useDefaultColumns) {
            tableConfiguration.tableColumns.push(
                new DefaultColumnConfiguration('test', 'test', ConfigurationType.TableColumn, 'test')
            )
        }
    }

}