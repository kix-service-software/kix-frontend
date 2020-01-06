/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Ticket } from '../../../src/frontend-applications/agent-portal/modules/ticket/model/Ticket';
import { TicketPlaceholderHandler, TicketLabelProvider } from '../../../src/frontend-applications/agent-portal/modules/ticket/webapp/core';
import { LabelService } from '../../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { TicketProperty } from '../../../src/frontend-applications/agent-portal/modules/ticket/model/TicketProperty';
import { DateTimeUtil } from '../../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/DateTimeUtil';
import { KIXObjectProperty } from '../../../src/frontend-applications/agent-portal/model/kix/KIXObjectProperty';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for ticket', () => {

    let ticket: Ticket;
    let ticketPlaceholderHandler: TicketPlaceholderHandler = new TicketPlaceholderHandler();
    before(() => {
        ticket = someTestFunctions.prepareTicket();

        const ticketLabelProvider = new TicketLabelProvider();
        ticketLabelProvider.getDisplayText = someTestFunctions.changedGetDisplayTextMethod;
        LabelService.getInstance().registerLabelProvider(ticketLabelProvider);
    });

    after(() => {
        LabelService.getInstance()['labelProviders'] = [];
    });

    describe('Replace simple ticket attribute placeholder', async () => {

        it('Should replace ticket number placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.TICKET_NUMBER}>`, ticket);
            expect(text).equal(ticket.TicketNumber);
        });

        it('Should replace ticket title placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.TITLE}>`, ticket);
            expect(text).equal(ticket.Title);
        });

        it('Should replace ticket title placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.TITLE}_5>`, ticket);
            expect(text).equal(ticket.Title.substr(0, 5));
        });

        it('Should replace ticket ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.TICKET_ID}>`, ticket);
            expect(text).equal(ticket.TicketID.toString());
        });

        it('Should replace ticket state ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.STATE_ID}>`, ticket);
            expect(text).equal(ticket.StateID.toString());
        });

        it('Should replace ticket state placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.STATE}>`, ticket);
            expect(text).equal(`${TicketProperty.STATE}_Name`);
        });

        it('Should replace ticket state type placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.STATE_TYPE}>`, ticket);
            expect(text).equal(`${TicketProperty.STATE_TYPE}_Name`);
        });

        it('Should replace ticket priority ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.PRIORITY_ID}>`, ticket);
            expect(text).equal(ticket.PriorityID.toString());
        });

        it('Should replace ticket priority placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.PRIORITY}>`, ticket);
            expect(text).equal(`${TicketProperty.PRIORITY}_Name`);
        });

        it('Should replace ticket lock ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.LOCK_ID}>`, ticket);
            expect(text).equal(ticket.LockID.toString());
        });

        it('Should replace ticket lock placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.LOCK}>`, ticket);
            expect(text).equal(`${TicketProperty.LOCK}_Name`);
        });

        it('Should replace ticket queue ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.QUEUE_ID}>`, ticket);
            expect(text).equal(ticket.QueueID.toString());
        });

        it('Should replace ticket queue placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.QUEUE}>`, ticket);
            expect(text).equal(`${TicketProperty.QUEUE}_Name`);
        });

        it('Should replace ticket organisation ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ORGANISATION_ID}>`, ticket);
            expect(text).equal(ticket.OrganisationID.toString());
        });

        it('Should replace ticket organisation placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ORGANISATION}>`, ticket);
            expect(text).equal(`${TicketProperty.ORGANISATION}_Name`);
        });

        it('Should replace ticket contact ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.CONTACT_ID}>`, ticket);
            expect(text).equal(ticket.ContactID.toString());
        });

        it('Should replace ticket contact placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.CONTACT}>`, ticket);
            expect(text).equal(`${TicketProperty.CONTACT}_Name`);
        });

        it('Should replace ticket owner ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.OWNER_ID}>`, ticket);
            expect(text).equal(ticket.OwnerID.toString());
        });

        it('Should replace ticket owner placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.OWNER}>`, ticket);
            expect(text).equal(`${TicketProperty.OWNER}_Name`);
        });

        it('Should replace ticket type ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.TYPE_ID}>`, ticket);
            expect(text).equal(ticket.TypeID.toString());
        });

        it('Should replace ticket type placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.TYPE}>`, ticket);
            expect(text).equal(`${TicketProperty.TYPE}_Name`);
        });

        it('Should replace ticket sla ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.SLA_ID}>`, ticket);
            expect(text).equal(ticket.SLAID.toString());
        });

        it('Should replace ticket sla placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.SLA}>`, ticket);
            expect(text).equal(`${TicketProperty.SLA}_Name`);
        });

        it('Should replace ticket service ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.SERVICE_ID}>`, ticket);
            expect(text).equal(ticket.ServiceID.toString());
        });

        it('Should replace ticket service placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.SERVICE}>`, ticket);
            expect(text).equal(`${TicketProperty.SERVICE}_Name`);
        });

        it('Should replace ticket responsible ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.RESPONSIBLE_ID}>`, ticket);
            expect(text).equal(ticket.ResponsibleID.toString());
        });

        it('Should replace ticket responsible placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.RESPONSIBLE}>`, ticket);
            expect(text).equal(`${TicketProperty.RESPONSIBLE}_Name`);
        });

        it('Should replace ticket archive flag placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ARCHIVE_FLAG}>`, ticket);
            expect(text).equal(ticket.ArchiveFlag);
        });

        it('Should replace ticket age placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.AGE}>`, ticket);
            const age = DateTimeUtil.calculateTimeInterval(Number(ticket.Age));
            expect(text).equal(age);
        });

        it('Should replace ticket created by placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${KIXObjectProperty.CREATE_BY}>`, ticket);
            expect(text).equal(`${KIXObjectProperty.CREATE_BY}_Name`);
        });

        it('Should replace ticket changed by placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${KIXObjectProperty.CHANGE_BY}>`, ticket);
            expect(text).equal(`${KIXObjectProperty.CHANGE_BY}_Name`);
        });
    });

    describe('Replace complex ticket attribute placeholder (translatable)', async () => {

        it('Should replace ticket pending time by placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.PENDING_TIME}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.PendingTime, 'en');
            expect(text, 'date is not localized correctly').equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.PENDING_TIME}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.PendingTime, 'de');
            expect(germanText, 'date is not localized correctly (german)').equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.PENDING_TIME}>`, ticket, 'de');
            expect(notGermanText, 'date should not localized to german').equal(date);
        });

        it('Should replace ticket create time placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.CREATED}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.Created, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.CREATED}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.Created, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.CREATED}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket create time unix placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.CREATED_TIME_UNIX}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.CreateTimeUnix * 1000, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.CREATED_TIME_UNIX}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.CreateTimeUnix * 1000, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.CREATED_TIME_UNIX}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket change time placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.CHANGED}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.Changed, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.CHANGED}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.Changed, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.CHANGED}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket escalation response time placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ESCALATION_RESPONSE_TIME}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationResponseTime * 1000, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.ESCALATION_RESPONSE_TIME}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationResponseTime * 1000, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ESCALATION_RESPONSE_TIME}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket escalation update time placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ESCALATION_UPDATE_TIME}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationUpdateTime * 1000, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.ESCALATION_UPDATE_TIME}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationUpdateTime * 1000, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ESCALATION_UPDATE_TIME}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket escalation solution time placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ESCALATION_SOLUTION_TIME}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationSolutionTime * 1000, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.ESCALATION_SOLUTION_TIME}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationSolutionTime * 1000, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ESCALATION_SOLUTION_TIME}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket escalation destination time placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ESCALATION_DESTINATION_TIME}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationDestinationTime * 1000, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.ESCALATION_DESTINATION_TIME}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationDestinationTime * 1000, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ESCALATION_DESTINATION_TIME}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket escalation destination date placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ESCALATION_DESTINATION_DATE}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationDestinationDate, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.ESCALATION_DESTINATION_DATE}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.EscalationDestinationDate, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ESCALATION_DESTINATION_DATE}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket first response time destination time placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.FIRST_RESPONSE_TIME_DESTINATION_TIME}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.FirstResponseTimeDestinationTime * 1000, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.FIRST_RESPONSE_TIME_DESTINATION_TIME}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.FirstResponseTimeDestinationTime * 1000, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.FIRST_RESPONSE_TIME_DESTINATION_TIME}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket first response time destination date placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.FIRST_RESPONSE_TIME_DESTINATION_DATE}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.FirstResponseTimeDestinationDate, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.FIRST_RESPONSE_TIME_DESTINATION_DATE}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.FirstResponseTimeDestinationDate, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.FIRST_RESPONSE_TIME_DESTINATION_DATE}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket update time destination time placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.UPDATE_TIME_DESTINATION_TIME}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.UpdateTimeDestinationTime * 1000, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.UPDATE_TIME_DESTINATION_TIME}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.UpdateTimeDestinationTime * 1000, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.UPDATE_TIME_DESTINATION_TIME}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket update time destination date placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.UPDATE_TIME_DESTINATION_DATE}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.UpdateTimeDestinationDate, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.UPDATE_TIME_DESTINATION_DATE}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.UpdateTimeDestinationDate, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.UPDATE_TIME_DESTINATION_DATE}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket solution time destination time placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.SOLUTION_TIME_DESTINATION_TIME}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.SolutionTimeDestinationTime * 1000, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.SOLUTION_TIME_DESTINATION_TIME}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.SolutionTimeDestinationTime * 1000, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.SOLUTION_TIME_DESTINATION_TIME}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace ticket solution time destination date placeholders', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.SOLUTION_TIME_DESTINATION_DATE}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(ticket.SolutionTimeDestinationDate, 'en');
            expect(text).equal(date);

            const germanText = await ticketPlaceholderHandler.replace(`<TR_KIX_TICKET_${TicketProperty.SOLUTION_TIME_DESTINATION_DATE}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(ticket.SolutionTimeDestinationDate, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.SOLUTION_TIME_DESTINATION_DATE}>`, ticket, 'de');
            expect(notGermanText).equal(date);
        });
    });

    describe('Replace dynamic field ticket attribute placeholder', async () => {

    });

    describe('Replace unknown or emtpy ticket attribute placeholder with empty string', async () => {

        it('Should replace unknown ticket attribute placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_UnknownAttribute>`, ticket);
            expect(text).exist;
            expect(text).equal('');
        });

        it('Should replace empty ticket attribute placeholder', async () => {
            const empty_1 = await ticketPlaceholderHandler.replace(`<KIX_TICKET_>`, ticket);
            expect(empty_1).exist;
            expect(empty_1).equal('');

            const empty_2 = await ticketPlaceholderHandler.replace(`<KIX_TICKET>`, ticket);
            expect(empty_2).exist;
            expect(empty_2).equal('');
        });
    });

});

class someTestFunctions {
    public static async changedGetDisplayTextMethod(ticket: Ticket, property: string): Promise<string> {
        let displayValue = ticket[property];
        switch (property) {
            case TicketProperty.STATE:
            case TicketProperty.STATE_TYPE:
            case TicketProperty.PRIORITY:
            case TicketProperty.LOCK:
            case TicketProperty.QUEUE:
            case TicketProperty.ORGANISATION:
            case TicketProperty.CONTACT:
            case TicketProperty.OWNER:
            case TicketProperty.TYPE:
            case TicketProperty.SLA:
            case TicketProperty.SERVICE:
            case TicketProperty.RESPONSIBLE:
            case KIXObjectProperty.CHANGE_BY:
            case KIXObjectProperty.CREATE_BY:
                displayValue = `${property}_Name`;
                break;
            case TicketProperty.AGE:
                displayValue = DateTimeUtil.calculateTimeInterval(Number(displayValue));
                break;
            default:
        }
        return typeof displayValue !== 'undefined' && displayValue !== null ? displayValue.toString() : null;
    }

    public static prepareTicket(): Ticket {
        const ticket = new Ticket();

        ticket.TicketNumber = '123456';
        ticket.Title = 'Test-Ticket';
        ticket.TicketID = 1;
        ticket.StateID = 1;
        ticket.PriorityID = 1;
        ticket.LockID = 1;
        ticket.QueueID = 1;
        ticket.OrganisationID = '1';
        ticket.ContactID = '1';
        ticket.OwnerID = 1;
        ticket.TypeID = 1;
        ticket.SLAID = 1;
        ticket.ServiceID = 1;
        ticket.ResponsibleID = 1;
        ticket.Age = 123456789;
        ticket.Created = '2019-05-30 08:45:30';
        ticket.CreateBy = 1;
        ticket.Changed = '2019-06-05 10:45:30';
        ticket.ChangeBy = 2;
        ticket.ArchiveFlag = 'y';
        ticket.PendingTime = '2019-06-11 11:11:11';

        ticket.CreateTimeUnix = 1559198730;
        ticket.TimeUnits = 120;

        ticket.EscalationResponseTime = 1559980800;
        ticket.EscalationUpdateTime = 1560067200;
        ticket.EscalationSolutionTime = 1560153600;
        ticket.EscalationDestinationTime = 1560240000;
        ticket.EscalationDestinationDate = '2019-06-11 10:00:00';
        ticket.FirstResponseTimeDestinationTime = 1560326400;
        ticket.FirstResponseTimeDestinationDate = '2019-06-12 10:00:00';
        ticket.UpdateTimeDestinationTime = 1560412800;
        ticket.UpdateTimeDestinationDate = '2019-06-13 10:00:00';
        ticket.SolutionTimeDestinationTime = 1560499200;
        ticket.SolutionTimeDestinationDate = '2019-06-14 10:00:00';

        return ticket;
    }
}
