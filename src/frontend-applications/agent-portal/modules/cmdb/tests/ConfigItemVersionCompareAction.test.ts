/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ConfigItemVersionCompareAction } from '../webapp/core';
import { Table, Row, RowObject } from '../../base-components/webapp/core/table';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('CMDBReadUIModule', () => {

    it('Action should not be configured as a link', () => {
        const action = new ConfigItemVersionCompareAction();
        expect(action.hasLink).false;
    });

    describe('init action', () => {

        const action = new ConfigItemVersionCompareAction();

        before(async () => {
            await action.initAction();
        });

        it('should have the correct text', () => {
            expect(action.text).equals('Translatable#Compare');
        });

        it('Should have the correct icon', () => {
            expect(action.icon).equals('kix-icon-comparison-version');
        });

    });

    describe('Handle canRun', () => {

        const action = new ConfigItemVersionCompareAction();

        describe('No rows selected', () => {
            before(async () => {
                await action.setData(new Testtable(false));
            });

            it('should not be executable', () => {
                expect(action.canRun()).false;
            });
        });

        describe('More than 1 row are selected', () => {
            before(async () => {
                await action.setData(new Testtable(true));
            });

            it('should not be executable', () => {
                expect(action.canRun()).true;
            });
        });

    });

});

class Testtable extends Table {

    private testRows: Row[];

    public constructor(private rowsSelected: boolean) {
        super(null, null, null);
        this.testRows = [
            new Row(this, 1, new RowObject([], {})),
            new Row(this, 2, new RowObject([], {})),
            new Row(this, 3, new RowObject([], {}))
        ]
    }

    public getSelectedRows(): Row[] {
        return this.rowsSelected ? this.testRows : [];
    }

}
