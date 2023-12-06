/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { TicketListContext } from '../webapp/core';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { TicketProperty } from '../model/TicketProperty';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('TicketListContext', () => {

    describe('Check LoadingOptions for tickets request', () => {

        let ticketListContext: TicketListContext;

        before(() => {
            ticketListContext = new TicketListContext(null, null, null);
            ticketListContext.prepareContextLoadingOptions = () => null;
            ticketListContext.setAdditionalInformation('Counter', 'OwnedAndSeen')
        });

        it('should request with correct loadingOptions', () => {

            const originalLoad = KIXObjectService.loadObjects;

            KIXObjectService.loadObjects = async <T extends KIXObject>(
                objectType: KIXObjectType | string, objectIds?: Array<number | string>,
                loadingOptions?: KIXObjectLoadingOptions
            ): Promise<T[]> => {

                expect(loadingOptions, 'No loading options!').exist;
                expect(loadingOptions.includes, 'No includes!').exist;
                expect(Array.isArray(loadingOptions.includes), 'No includes!').true;
                expect(loadingOptions.includes.length).greaterThan(0, 'No includes!');
                expect(loadingOptions.includes.some((i) => i === TicketProperty.WATCHERS), 'No Watchers include!').true;
                expect(loadingOptions.includes.some((i) => i === TicketProperty.STATE_TYPE), 'No StateType include!').true;

                expect(loadingOptions.query, 'No query!').exist;
                expect(loadingOptions.query.length).greaterThan(0, 'No query!');
                expect(loadingOptions.query.some((q) => q[0] === 'Counter' && q[1] === 'OwnedAndSeen'), 'No matching counter query!').true;

                return [];
            }

            ticketListContext.loadTickets();

            expect(true).true;

            KIXObjectService.loadObjects = originalLoad;

        });

    });

});