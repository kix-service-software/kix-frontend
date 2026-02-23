/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { Ticket } from '../../src/frontend-applications/agent-portal/modules/ticket/model/Ticket';
import { KIXObjectLoadingOptions } from '../../src/frontend-applications/agent-portal/model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../src/frontend-applications/agent-portal/model/FilterCriteria';
import { TicketProperty } from '../../src/frontend-applications/agent-portal/modules/ticket/model/TicketProperty';
import { SearchOperator } from '../../src/frontend-applications/agent-portal/modules/search/model/SearchOperator';
import { FilterDataType } from '../../src/frontend-applications/agent-portal/model/FilterDataType';
import { FilterType } from '../../src/frontend-applications/agent-portal/model/FilterType';
import { LoadingOptionsUtil } from '../../src/frontend-applications/agent-portal/model/LoadingOptionsUtil';
import { LabelService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { TicketLabelProvider } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core';
import { PlaceholderService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/PlaceholderService';
import { TicketPlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/TicketPlaceholderHandler';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('PrepareLoadingOptions', () => {

    before(() => {
        PlaceholderService.getInstance().registerPlaceholderHandler(new TicketPlaceholderHandler())
        LabelService.getInstance().registerLabelProvider(new TicketLabelProvider());
    });

    after(() => {

    });

    describe('Prepare loading options with single string filter criterion', () => {

        const ticket = new Ticket();
        ticket.OrganisationID = 1;

        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.filter = [
            new FilterCriteria(
                TicketProperty.ORGANISATION_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, '<KIX_TICKET_OrganisationID>'
            )
        ];



        it('should replace the single string placeholder', async () => {
            const preparedOptions = await LoadingOptionsUtil.prepareLoadingOptions(ticket, loadingOptions, '');
            expect(preparedOptions.filter?.length).equals(1);
            expect(preparedOptions.filter?.[0].value).equals('1');
        });

    });

    describe('Prepare loading options with array of strings filter criterion', () => {

        const ticket = new Ticket();
        ticket.OrganisationID = 1;
        ticket.PriorityID = 3;

        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.filter = [
            new FilterCriteria(
                TicketProperty.ORGANISATION_ID, SearchOperator.IN, FilterDataType.NUMERIC, FilterType.AND,
                [
                    '2',
                    '3',
                    '<KIX_TICKET_OrganisationID>',
                    '<KIX_TICKET_PriorityID>'
                ]
            )
        ];



        it('should replace the single string placeholder', async () => {
            const preparedOptions = await LoadingOptionsUtil.prepareLoadingOptions(ticket, loadingOptions, '');
            expect(preparedOptions.filter?.length).equals(1);
            expect(preparedOptions.filter?.[0].value).an('array');
            if (Array.isArray(preparedOptions.filter?.[0].value)) {
                expect(preparedOptions.filter?.[0].value?.length).equals(4);
                expect(preparedOptions.filter?.[0].value[0]).equals('2');
                expect(preparedOptions.filter?.[0].value[1]).equals('3');
                expect(preparedOptions.filter?.[0].value[2]).equals('1');
                expect(preparedOptions.filter?.[0].value[3]).equals('3');
            }
        });

    });

});