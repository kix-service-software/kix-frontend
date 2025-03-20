/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { OutOfOffice } from '../../src/frontend-applications/agent-portal/modules/user/model/OutOfOffice';


chai.use(chaiAsPromised);
const expect = chai.expect;

describe('OutOfOffice', () => {

    describe('Prepare OutOfOffice', () => {

        let outOfOffice: OutOfOffice;

        before(() => {
            outOfOffice = new OutOfOffice(
                undefined, '2024-01-01', '2024-01-05'
            );
        });

        it('Have the correct Start', () => {
            expect(outOfOffice.Start).equals('2024-01-01');
        });
        it('Have the correct End', () => {
            expect(outOfOffice.End).equals('2024-01-05');
        });

    });
});