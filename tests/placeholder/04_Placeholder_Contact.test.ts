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
import { Contact } from '../../src/frontend-applications/agent-portal/modules/customer/model/Contact';
import { ContactLabelProvider } from '../../src/frontend-applications/agent-portal/modules/customer/webapp/core/ContactLabelProvider';
import { ContactPlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/customer/webapp/core/ContactPlaceholderHandler';
import { LabelService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { ContactProperty } from '../../src/frontend-applications/agent-portal/modules/customer/model/ContactProperty';
import { KIXObjectProperty } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectProperty';
import { DateTimeUtil } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/DateTimeUtil';
import { Ticket } from '../../src/frontend-applications/agent-portal/modules/ticket/model/Ticket';
import { KIXObjectService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { TicketPlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/TicketPlaceholderHandler';
import { User } from '../../src/frontend-applications/agent-portal/modules/user/model/User';
import { UserProperty } from '../../src/frontend-applications/agent-portal/modules/user/model/UserProperty';
import { TranslationService } from '../../src/frontend-applications/agent-portal/modules/translation/webapp/core/TranslationService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for contact', () => {

    let contact: Contact
    let contactPlaceholderHandler: ContactPlaceholderHandler = new ContactPlaceholderHandler();
    before(() => {
        LabelService.getInstance()['objectLabelProvider'] = [];
        LabelService.getInstance()['propertiesLabelProvider'].clear();
        contact = someTestFunctions.prepareUser();

        const contactLabelProvider = new ContactLabelProvider();
        contactLabelProvider.getDisplayText = someTestFunctions.changedGetDisplayTextMethod;
        LabelService.getInstance().registerLabelProvider(contactLabelProvider);
        (TranslationService.getInstance() as any).translations = {};
    });

    after(() => {
        LabelService.getInstance()['objectLabelProvider'] = [];
        LabelService.getInstance()['propertiesLabelProvider'].clear();
        (TranslationService.getInstance() as any).translations = null;
    });

    describe('Replace simple contact attribute placeholder.', async () => {

        it('Should replace contact ID placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.ID}>`, contact);
            expect(text).equal(contact.ID.toString());
        });

        it('Should replace contact login placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${UserProperty.USER_LOGIN}>`, contact);
            expect(text).equal(contact.User.UserLogin);
        });

        it('Should replace contact firstname placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.FIRSTNAME}>`, contact);
            expect(text).equal(contact.Firstname);
        });

        it('Should replace contact lastname placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.LASTNAME}>`, contact);
            expect(text).equal(contact.Lastname);
        });

        it('Should replace contact email placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.EMAIL}>`, contact);
            expect(text).equal(contact.Email);
        });

        it('Should replace contact primary organisation id placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.PRIMARY_ORGANISATION_ID}>`, contact);
            expect(text).equal(contact.PrimaryOrganisationID.toString());
        });

        it('Should replace contact organisation ids placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.ORGANISATION_IDS}>`, contact);
            expect(text).equal(contact.OrganisationIDs.toString());
        });

        it('Should replace contact mobil placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.MOBILE}>`, contact);
            expect(text).equal(contact.Mobile);
        });

        it('Should replace contact phone placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.PHONE}>`, contact);
            expect(text).equal(contact.Phone);
        });

        it('Should replace contact fax placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.FAX}>`, contact);
            expect(text).equal(contact.Fax);
        });

        it('Should replace contact street placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.STREET}>`, contact);
            expect(text).equal(contact.Street);
        });

        it('Should replace contact zip placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.ZIP}>`, contact);
            expect(text).equal(contact.Zip);
        });

        it('Should replace contact city placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.CITY}>`, contact);
            expect(text).equal(contact.City);
        });

        it('Should replace contact country placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.COUNTRY}>`, contact);
            expect(text).equal(contact.Country);
        });

        it('Should replace contact comment placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.COMMENT}>`, contact);
            expect(text).equal(contact.Comment);
        });

        it('Should replace contact user comment placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${UserProperty.USER_COMMENT}>`, contact);
            expect(text).equal(contact.User.UserComment);
        });

        it('Should replace contact create by placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${KIXObjectProperty.CREATE_BY}>`, contact);
            expect(text).equal(`${KIXObjectProperty.CREATE_BY}_Name`);
        });

        it('Should replace contact change by placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${KIXObjectProperty.CHANGE_BY}>`, contact);
            expect(text).equal(`${KIXObjectProperty.CHANGE_BY}_Name`);
        });

        it('Should replace contact valid id placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${KIXObjectProperty.VALID_ID}>`, contact);
            expect(text).equal(contact.ValidID.toString());
        });

        it('Should replace contact valid placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.VALID}>`, contact);
            expect(text).equal(`${ContactProperty.VALID}_Name`);
        });
    });

    describe('Replace complex contact attribute placeholder (translatable).', async () => {

        it('Should replace contact create time placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${KIXObjectProperty.CREATE_TIME}>`, contact);
            const date = await DateTimeUtil.getLocalDateTimeString(contact.CreateTime, 'en');
            expect(text).equal(date);

            const germanText = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${KIXObjectProperty.CREATE_TIME}>`, contact, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(contact.CreateTime, 'de');
            expect(germanText).equal(germanDate);
        });

        it('Should replace contact change time placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${KIXObjectProperty.CHANGE_TIME}>`, contact);
            const date = await DateTimeUtil.getLocalDateTimeString(contact.ChangeTime, 'en');
            expect(text).equal(date);

            const germanText = await contactPlaceholderHandler.replace(`<KIX_CONTACT_${KIXObjectProperty.CHANGE_TIME}>`, contact, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(contact.ChangeTime, 'de');
            expect(germanText).equal(germanDate);
        });
    });

    describe('Replace dynamic field contact attribute placeholder.', async () => {

    });

    describe('Replace unknown or emtpy contact attribute placeholder with empty string.', async () => {

        it('Should replace unknown contact attribute placeholder', async () => {
            const text = await contactPlaceholderHandler.replace(`<KIX_CONTACT_UnknownAttribute>`, contact);
            expect(text).exist;
            expect(text).equal('');
        });

        it('Should replace empty contact attribute placeholder', async () => {
            const empty_1 = await contactPlaceholderHandler.replace(`<KIX_CONTACT_>`, contact);
            expect(empty_1).exist;
            expect(empty_1).equal('');

            const empty_2 = await contactPlaceholderHandler.replace(`<KIX_CONTACT>`, contact);
            expect(empty_2).exist;
            expect(empty_2).equal('');
        });
    });

    describe('Replace with contact placeholder from ticket.', async () => {

        const ticket: Ticket = new Ticket();
        const contact: Contact = new Contact();
        let orgLoadFuntion;
        before(() => {
            contact.Firstname = 'Contact';
            contact.Email = 'contact@ticket.com';
            ticket.ContactID = 2;
            orgLoadFuntion = KIXObjectService.loadObjects;
            KIXObjectService.loadObjects = async (objectType, objectIds: Array<string | number>) => {
                let objects: Contact[] = [];
                if (objectIds && objectType === KIXObjectType.CONTACT) {
                    if (objectIds[0] === ticket.ContactID) {
                        objects = [contact];
                    }
                }
                return objects as any[];
            }
        });

        after(() => {
            KIXObjectService.loadObjects = orgLoadFuntion;
        });

        it('Should replace contact attribute placeholder from ticket contact', async () => {
            let ticketPlaceholderHandler: TicketPlaceholderHandler = new TicketPlaceholderHandler();
            const firstname = await ticketPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.FIRSTNAME}>`, ticket);
            expect(firstname).exist;
            expect(firstname, 'should be firstname of ticket contact').equal(contact.Firstname);
            const email = await ticketPlaceholderHandler.replace(`<KIX_CONTACT_${ContactProperty.EMAIL}>`, ticket);
            expect(email).exist;
            expect(email, 'should be email of ticket contact').equal(contact.Email);
        });
    });
});

class someTestFunctions {
    public static async changedGetDisplayTextMethod(contact: Contact, property: string): Promise<string> {
        let displayValue = contact[property];
        switch (property) {
            case KIXObjectProperty.CHANGE_BY:
            case KIXObjectProperty.CREATE_BY:
            case ContactProperty.VALID:
            case ContactProperty.PRIMARY_ORGANISATION:
            case ContactProperty.ORGANISATIONS:
                displayValue = `${property}_Name`;
                break;
            default:
                if (contact.User && contact.User[property]) {
                    displayValue = contact.User[property];
                }
        }
        return typeof displayValue !== 'undefined' && displayValue !== null ? displayValue.toString() : null;
    }

    public static prepareUser(): Contact {
        const contact = new Contact();
        const user = new User();

        user.UserLogin = 'PlaceholderTest';
        user.UserComment = 'some user comment';

        contact.ID = 2;
        contact.Firstname = 'Placeholder';
        contact.Lastname = 'Test';
        contact.Email = 'placeholder@test.com';
        contact.PrimaryOrganisationID = 5;
        contact.OrganisationIDs = [5, 3];
        contact.Mobile = '0123 456789';
        contact.Phone = '9876 54321';
        contact.Fax = '9876 54321-2';
        contact.Street = 'somewhere alley 42';
        contact.Zip = '01234';
        contact.City = 'Nowhere';
        contact.Country = 'Anywhere';
        contact.ValidID = 1;
        contact.Title = 'some title';
        contact.Comment = 'some comment';
        contact.CreateTime = '2019-05-30 08:45:30';
        contact.CreateBy = 1;
        contact.ChangeTime = '2019-06-05 10:45:30';
        contact.ChangeBy = 2;

        contact.User = user;

        return contact;
    }
}
