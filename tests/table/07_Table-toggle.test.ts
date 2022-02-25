/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Table } from '../../src/frontend-applications/agent-portal/modules/table/model/Table';
import { RowObject } from '../../src/frontend-applications/agent-portal/modules/table/model/RowObject';
import { TableValue } from '../../src/frontend-applications/agent-portal/modules/table/model/TableValue';
import { TableContentProvider } from '../../src/frontend-applications/agent-portal/modules/table/webapp/core/TableContentProvider';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { DefaultColumnConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/DefaultColumnConfiguration';


chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Toggle Tests', () => {
    let table: Table;

    before(async () => {
        table = new Table('test');
        table.setContentProvider(new TestTableContentProvider(10, 3));
        table.setColumnConfiguration([
            new DefaultColumnConfiguration(null, null, null, '0'), new DefaultColumnConfiguration(null, null, null, '1'), new DefaultColumnConfiguration(null, null, null, '2')
        ]);
        await table.initialize();
    });

    describe('Toggle one row.', () => {
        it('Should return false on initnal state.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            expect(row.isExpanded()).is.false;
        });

        it('Should return true if row is expanded.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            row.expand();
            expect(row.isExpanded()).is.true;
            row.expand();
            expect(row.isExpanded()).is.true;
            row.expand(true);
            expect(row.isExpanded()).is.true;
        });

        it('Should return false if row is closed.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            row.expand();
            expect(row.isExpanded()).is.true;
            row.expand(false);
            expect(row.isExpanded()).is.false;
        });
    });
});

class TestTableContentProvider extends TableContentProvider {

    public constructor(
        private rowCount = 1,
        private cellCount = 2,
    ) {
        super(null, null, null, null);
    }

    public async initialize(): Promise<void> { }

    public getObjectType(): KIXObjectType | string {
        return KIXObjectType.ANY;
    }

    public async loadData(): Promise<RowObject[]> {
        const objects = [];
        for (let r = 0; r < this.rowCount; r++) {
            const values: TableValue[] = [];

            for (let c = 0; c < this.cellCount; c++) {
                values.push(new TableValue(`${c}`, `value-${r}-${c}`, `value-${r}-${c}`));
            }

            objects.push(new RowObject(values));
        }
        return objects;
    }

    public async destroy(): Promise<void> {
        //
    }

}
