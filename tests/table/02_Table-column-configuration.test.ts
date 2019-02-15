/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Table, ITable, IColumnConfiguration, DefaultColumnConfiguration } from '../../src/core/browser/table';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Column Configuration Tests', () => {

    describe('Create a table instance with column configuration.', () => {
        let table: ITable;

        before(() => table = new Table());

        it('DefaultColumnConfguration should have right defaults.', async () => {
            const config = new DefaultColumnConfiguration('1');
            expect(config.showIcon).is.true;
            expect(config.showText).is.true;
        });

        it('Should initialize a table with the correct amount of columns.', async () => {
            const columnConfiguration: IColumnConfiguration[] = [
                new DefaultColumnConfiguration('1'), new DefaultColumnConfiguration('2'), new DefaultColumnConfiguration('3'),
                new DefaultColumnConfiguration('4'), new DefaultColumnConfiguration('5'), new DefaultColumnConfiguration('4')
            ];

            table.setColumnConfiguration(columnConfiguration);
            await table.initialize();

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).an('array');
            expect(columns.length).equals(6);
        });
    });
});
