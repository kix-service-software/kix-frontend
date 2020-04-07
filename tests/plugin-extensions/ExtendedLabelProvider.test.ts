/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable*/
import * as chai from 'chai';
const expect = chai.expect;

import { TicketLabelProvider } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/TicketLabelProvider';
import { ExtendedLabelProvider } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ExtendedLabelProvider';
import { DynamicFieldValue } from '../../src/frontend-applications/agent-portal/modules/dynamic-fields/model/DynamicFieldValue';
import { LabelService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';

describe('ExtendedLabelProvider', () => {

    before(() => {
        const ticketLabelProvider = new TicketLabelProvider();
        LabelService.getInstance().registerLabelProvider(ticketLabelProvider);
        ticketLabelProvider.addExtendedLabelProvider(new ExtendedTestLabelProvider())
    });

    describe('Overwrite getDFDisplayValues()', () => {
        it('Should return overwritten dynamic field values', async () => {
            const fieldValue = new DynamicFieldValue();
            fieldValue.Name = 'TestDynamicField';
            const values = await LabelService.getInstance().getDFDisplayValues(KIXObjectType.TICKET, fieldValue);

            expect(values).exist;
            expect(values[0]).exist;
            expect(values[1]).exist;
            expect(values[2]).exist;

            expect(values[0]).an('array');
            expect(values[0]).length(4);
        });
    });

});

class ExtendedTestLabelProvider extends ExtendedLabelProvider {

    public async getDFDisplayValues(fieldValue: DynamicFieldValue): Promise<[string[], string, string[]]> {
        const values = ['value1', 'value2', 'value3', 'value4'];
        return [values, values.join(', '), values];
    }
}