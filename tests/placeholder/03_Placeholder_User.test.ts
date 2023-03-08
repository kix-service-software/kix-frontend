/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { User } from '../../src/frontend-applications/agent-portal/modules/user/model/User';
import { UserPlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/user/webapp/core/UserPlaceholderHandler';
import { UserLabelProvider } from '../../src/frontend-applications/agent-portal/modules/user/webapp/core/UserLabelProvider';
import { LabelService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { AgentService } from '../../src/frontend-applications/agent-portal/modules/user/webapp/core/AgentService';
import { UserProperty } from '../../src/frontend-applications/agent-portal/modules/user/model/UserProperty';
import { KIXObjectProperty } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectProperty';
import { DateTimeUtil } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/DateTimeUtil';
import { Ticket } from '../../src/frontend-applications/agent-portal/modules/ticket/model/Ticket';
import { TicketPlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/TicketPlaceholderHandler';
import { KIXObjectService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { UserPreference } from '../../src/frontend-applications/agent-portal/modules/user/model/UserPreference';
import { PersonalSettingsProperty } from '../../src/frontend-applications/agent-portal/modules/user/model/PersonalSettingsProperty';
import { ContactProperty } from '../../src/frontend-applications/agent-portal/modules/customer/model/ContactProperty';
import { Contact } from '../../src/frontend-applications/agent-portal/modules/customer/model/Contact';
import { TranslationService } from '../../src/frontend-applications/agent-portal/modules/translation/webapp/core/TranslationService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for user', () => {

    let user: User;
    let userPlaceholderHandler: UserPlaceholderHandler = new UserPlaceholderHandler();
    let orgFunction;
    before(() => {
        LabelService.getInstance()['objectLabelProvider'] = [];
        LabelService.getInstance()['propertiesLabelProvider'].clear();
        user = someTestFunctions.prepareUser();

        const userLabelProvider = new UserLabelProvider();
        userLabelProvider.getDisplayText = someTestFunctions.changedUserGetDisplayTextMethod;
        LabelService.getInstance().registerLabelProvider(userLabelProvider);

        orgFunction = AgentService.getInstance().getCurrentUser;
        AgentService.getInstance().getCurrentUser = async () => {
            return user;
        }
        (TranslationService.getInstance() as any).translations = {};
    });

    after(() => {
        AgentService.getInstance().getCurrentUser = orgFunction;
        LabelService.getInstance()['objectLabelProvider'] = [];
        LabelService.getInstance()['propertiesLabelProvider'].clear();
        (TranslationService.getInstance() as any).translations = null;
    });

    describe('Replace simple current user attribute placeholder.', async () => {

        it('Should replace user ID placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_ID}>`);
            expect(text).equal(user.UserID.toString());
        });

        it('Should replace user login placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_LOGIN}>`);
            expect(text).equal(user.UserLogin);
        });

        it('Should replace user firstname placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${ContactProperty.FIRSTNAME}>`);
            expect(text).equal(user.Contact.Firstname);
        });

        it('Should replace user lastname placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${ContactProperty.LASTNAME}>`);
            expect(text).equal(user.Contact.Lastname);
        });

        it('Should replace user fullname placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${ContactProperty.FULLNAME}>`);
            expect(text).equal(user.Contact.Fullname);
        });

        it('Should replace user email placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${ContactProperty.EMAIL}>`);
            expect(text).equal(user.Contact.Email);
        });

        it('Should replace user mobil placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${ContactProperty.MOBILE}>`);
            expect(text).equal(user.Contact.Mobile);
        });

        it('Should replace user phone placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${ContactProperty.PHONE}>`);
            expect(text).equal(user.Contact.Phone);
        });

        it('Should replace user comment placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_COMMENT}>`);
            expect(text).equal(user.UserComment);
        });

        it('Should replace user contaxt comment placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${ContactProperty.COMMENT}>`);
            expect(text).equal(user.Contact.Comment);
        });

        it('Should replace user create by placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CREATE_BY}>`);
            expect(text).equal(`${KIXObjectProperty.CREATE_BY}_Name`);
        });

        it('Should replace user change by placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CHANGE_BY}>`);
            expect(text).equal(`${KIXObjectProperty.CHANGE_BY}_Name`);
        });

        it('Should replace user valid id placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.VALID_ID}>`);
            expect(text).equal(user.ValidID.toString());
        });

        it('Should replace user valid placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${UserProperty.USER_VALID}>`);
            expect(text).equal(`${UserProperty.USER_VALID}_Name`);
        });

        it('Should replace user language placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${PersonalSettingsProperty.USER_LANGUAGE}>`);
            expect(text).equal('en');
        });
    });

    describe('Replace complex user attribute placeholder (translatable).', async () => {

        it('Should replace user create time placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CREATE_TIME}>`);
            const date = await DateTimeUtil.getLocalDateTimeString(user.CreateTime, 'en');
            expect(text).equal(date);

            const germanText = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CREATE_TIME}>`, null, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(user.CreateTime, 'de');
            expect(germanText).equal(germanDate);
        });

        it('Should replace user change time placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CHANGE_TIME}>`);
            const date = await DateTimeUtil.getLocalDateTimeString(user.ChangeTime, 'en');
            expect(text).equal(date);

            const germanText = await userPlaceholderHandler.replace(`<KIX_CURRENT_${KIXObjectProperty.CHANGE_TIME}>`, null, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(user.ChangeTime, 'de');
            expect(germanText).equal(germanDate);
        });
    });

    describe('Replace dynamic field user attribute placeholder.', async () => {

    });

    describe('Replace unknown or emtpy user attribute placeholder with empty string.', async () => {

        it('Should replace unknown user attribute placeholder', async () => {
            const text = await userPlaceholderHandler.replace(`<KIX_CURRENT_UnknownAttribute>`);
            expect(text).exist;
            expect(text).equal('');
        });

        it('Should replace empty user attribute placeholder', async () => {
            const empty_1 = await userPlaceholderHandler.replace(`<KIX_CURRENT_>`);
            expect(empty_1).exist;
            expect(empty_1).equal('');

            const empty_2 = await userPlaceholderHandler.replace(`<KIX_CURRENT>`);
            expect(empty_2).exist;
            expect(empty_2).equal('');
        });
    });

    describe('Replace with user placeholder from ticket.', async () => {

        const ticket: Ticket = new Ticket();
        let ticketPlaceholderHandler: TicketPlaceholderHandler = new TicketPlaceholderHandler();
        const owner: User = new User();
        owner.Contact = new Contact();
        const responsible: User = new User();
        responsible.Contact = new Contact();
        let orgLoadFuntion;
        before(() => {
            owner.Contact.Firstname = 'Owner';
            owner.Contact.Email = 'owner@ticket.com';
            responsible.Contact.Firstname = 'Responsible';
            responsible.Contact.Email = 'respnsible@ticket.com';
            ticket.OwnerID = 2;
            ticket.ResponsibleID = 3;
            orgLoadFuntion = KIXObjectService.loadObjects;
            KIXObjectService.loadObjects = async (objectType, objectIds: Array<string | number>) => {
                let objects: User[] = [];
                if (objectIds && objectType === KIXObjectType.USER) {
                    if (objectIds[0] === ticket.OwnerID) {
                        objects = [owner];
                    }
                    if (objectIds[0] === ticket.ResponsibleID) {
                        objects = [responsible];
                    }
                }
                return objects as any[];
            }
        });

        after(() => {
            KIXObjectService.loadObjects = orgLoadFuntion;
        });

        // it('Should replace user attribute placeholder from owner', async () => {
        //     const firstname = await ticketPlaceholderHandler.replace(`<KIX_OWNER_${ContactProperty.FIRSTNAME}>`, ticket);
        //     expect(firstname).exist;
        //     expect(firstname, 'should be firstname of ticket owner').equal(owner.Contact.Firstname);
        //     const email = await ticketPlaceholderHandler.replace(`<KIX_TICKETOWNER_${ContactProperty.EMAIL}>`, ticket);
        //     expect(email).exist;
        //     expect(email, 'should be email of ticket owner').equal(owner.Contact.Email);
        // });

        // it('Should replace user attribute placeholder from responsible', async () => {
        //     const firstname = await ticketPlaceholderHandler.replace(`<KIX_RESPONSIBLE_${ContactProperty.FIRSTNAME}>`, ticket);
        //     expect(firstname).exist;
        //     expect(firstname, 'should be firstname of ticket responsible').equal(responsible.Contact.Firstname);
        //     const email = await ticketPlaceholderHandler.replace(`<KIX_TICKETRESPONSIBLE_${ContactProperty.EMAIL}>`, ticket);
        //     expect(email).exist;
        //     expect(email, 'should be email of ticket responsible').equal(responsible.Contact.Email);
        // });
    });
});

class someTestFunctions {
    public static async changedUserGetDisplayTextMethod(user: User, property: string): Promise<string> {
        let displayValue = user[property];
        switch (property) {
            case KIXObjectProperty.CHANGE_BY:
            case KIXObjectProperty.CREATE_BY:
            case UserProperty.USER_LAST_LOGIN:
            case UserProperty.USER_VALID:
                displayValue = `${property}_Name`;
                break;
            case ContactProperty.FIRSTNAME:
                displayValue = user.Contact?.Firstname;
                break;
            case ContactProperty.LASTNAME:
                displayValue = user.Contact?.Lastname;
                break;
            case PersonalSettingsProperty.USER_LANGUAGE:
                if (user.Preferences) {
                    const languagePreference = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.USER_LANGUAGE);
                    if (languagePreference) {
                        displayValue = languagePreference.Value;
                    }
                }
                break;
            default:
                if (user.Contact && user.Contact[property]) {
                    displayValue = user.Contact[property];
                }
        }
        return typeof displayValue !== 'undefined' && displayValue !== null ? displayValue.toString() : null;
    }

    public static prepareUser(): User {
        const contact = new Contact();
        contact.Title = 'some title';
        contact.Firstname = 'Placeholder';
        contact.Lastname = 'Test';
        contact.Fullname = 'Placeholder Test';
        contact.Email = 'placeholder@test.com';
        contact.Mobile = '0123 456789';
        contact.Phone = '9876 54321';
        contact.Comment = 'some contact comment';

        const preference = new UserPreference();
        preference.ID = PersonalSettingsProperty.USER_LANGUAGE;
        preference.Value = 'en';

        const user = new User();
        user.UserID = 2;
        user.UserLogin = 'PlaceholderTest';
        user.ValidID = 1;
        user.UserComment = 'some comment';
        user.CreateTime = '2019-05-30 08:45:30';
        user.CreateBy = 1;
        user.ChangeTime = '2019-06-05 10:45:30';
        user.ChangeBy = 2;

        user.Contact = contact;
        user.Preferences = [
            preference
        ]

        return user;
    }
}
