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
import { Ticket } from '../../src/frontend-applications/agent-portal/modules/ticket/model/Ticket';
import { TicketLabelProvider } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/TicketLabelProvider';
import { TicketPlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/TicketPlaceholderHandler';
import { LabelService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { TicketProperty } from '../../src/frontend-applications/agent-portal/modules/ticket/model/TicketProperty';
import { DateTimeUtil } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/DateTimeUtil';
import { KIXObjectProperty } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectProperty';
import { DynamicFieldValue } from '../../src/frontend-applications/agent-portal/modules/dynamic-fields/model/DynamicFieldValue';
import { TranslationService } from '../../src/frontend-applications/agent-portal/modules/translation/webapp/core/TranslationService';

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
        (TranslationService.getInstance() as any).translations = {};
    });

    after(() => {
        LabelService.getInstance()['labelProviders'] = [];
        (TranslationService.getInstance() as any).translations = null;
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

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket state placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.STATE}>`, ticket);
        //     expect(text).equal(`${TicketProperty.STATE}_Name`);
        // });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket state type placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.STATE_TYPE}>`, ticket);
        //     expect(text).equal(`${TicketProperty.STATE_TYPE}_Name`);
        // });

        it('Should replace ticket priority ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.PRIORITY_ID}>`, ticket);
            expect(text).equal(ticket.PriorityID.toString());
        });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket priority placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.PRIORITY}>`, ticket);
        //     expect(text).equal(`${TicketProperty.PRIORITY}_Name`);
        // });

        it('Should replace ticket lock ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.LOCK_ID}>`, ticket);
            expect(text).equal(ticket.LockID.toString());
        });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket lock placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.LOCK}>`, ticket);
        //     expect(text).equal(`${TicketProperty.LOCK}_Name`);
        // });

        it('Should replace ticket queue ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.QUEUE_ID}>`, ticket);
            expect(text).equal(ticket.QueueID.toString());
        });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket queue placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.QUEUE}>`, ticket);
        //     expect(text).equal(`${TicketProperty.QUEUE}_Name`);
        // });

        it('Should replace ticket organisation ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ORGANISATION_ID}>`, ticket);
            expect(text).equal(ticket.OrganisationID.toString());
        });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket organisation placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ORGANISATION}>`, ticket);
        //     expect(text).equal(`${TicketProperty.ORGANISATION}_Name`);
        // });

        it('Should replace ticket contact ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.CONTACT_ID}>`, ticket);
            expect(text).equal(ticket.ContactID.toString());
        });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket contact placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.CONTACT}>`, ticket);
        //     expect(text).equal(`${TicketProperty.CONTACT}_Name`);
        // });

        it('Should replace ticket owner ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.OWNER_ID}>`, ticket);
            expect(text).equal(ticket.OwnerID.toString());
        });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket owner placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.OWNER}>`, ticket);
        //     expect(text).equal(`${TicketProperty.OWNER}_Name`);
        // });

        it('Should replace ticket type ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.TYPE_ID}>`, ticket);
            expect(text).equal(ticket.TypeID.toString());
        });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket type placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.TYPE}>`, ticket);
        //     expect(text).equal(`${TicketProperty.TYPE}_Name`);
        // });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket sla placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.SLA}>`, ticket);
        //     expect(text).equal(`${TicketProperty.SLA}_Name`);
        // });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket service placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.SERVICE}>`, ticket);
        //     expect(text).equal(`${TicketProperty.SERVICE}_Name`);
        // });

        it('Should replace ticket responsible ID placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.RESPONSIBLE_ID}>`, ticket);
            expect(text).equal(ticket.ResponsibleID.toString());
        });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket responsible placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.RESPONSIBLE}>`, ticket);
        //     expect(text).equal(`${TicketProperty.RESPONSIBLE}_Name`);
        // });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket archive flag placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.ARCHIVE_FLAG}>`, ticket);
        //     expect(text).equal(ticket.ArchiveFlag);
        // });

        it('Should replace ticket age placeholder', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${TicketProperty.AGE}>`, ticket);
            const age = DateTimeUtil.calculateTimeInterval(Number(ticket.Age));
            expect(text).equal(age);
        });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket created by placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${KIXObjectProperty.CREATE_BY}>`, ticket);
        //     expect(text).equal(`${KIXObjectProperty.CREATE_BY}_Name`);
        // });

        // FIXME: Solve Test @Ricky Kaiser
        // it('Should replace ticket changed by placeholder', async () => {
        //     const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_${KIXObjectProperty.CHANGE_BY}>`, ticket);
        //     expect(text).equal(`${KIXObjectProperty.CHANGE_BY}_Name`);
        // });
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
    });

    describe('Replace dynamic field ticket attribute placeholder', async () => {
        it('Should replace text placeholder with value string', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_DynamicField_${ticket.DynamicFields[0].Name}>`, ticket);
            expect(text).equal(ticket.DynamicFields[0].DisplayValue);
        });

        it('Should replace selection placeholder with value string', async () => {
            const text = await ticketPlaceholderHandler.replace(`<KIX_TICKET_DynamicField_${ticket.DynamicFields[1].Name}>`, ticket);
            expect(text).equal(ticket.DynamicFields[1].DisplayValue);
        });
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
        ticket.ResponsibleID = 1;
        ticket.Age = 123456789;
        ticket.Created = '2019-05-30 08:45:30';
        ticket.CreateBy = 1;
        ticket.Changed = '2019-06-05 10:45:30';
        ticket.ChangeBy = 2;
        ticket.ArchiveFlag = 'y';
        ticket.PendingTime = '2019-06-11 11:11:11';

        ticket.CreateTimeUnix = 1559198730;

        ticket.DynamicFields = [
            new DynamicFieldValue(
                {
                    ID: '1', Name: 'TicketTextDF', Label: 'Ticket Text DF',
                    Value: ['Test Text', 'Test Text 2'], DisplayValue: 'Test Text, Test Text 2'
                } as DynamicFieldValue
            ),
            new DynamicFieldValue(
                {
                    ID: '1', Name: 'TicketSelectionDF', Label: 'Ticket Selection DF',
                    Value: ['1', '3', '5'], DisplayValue: 'One, Three, Five'
                } as DynamicFieldValue
            ),
        ]

        return ticket;
    }
}
