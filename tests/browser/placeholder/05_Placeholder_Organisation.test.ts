/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { TicketPlaceholderHandler } from '../../../src/core/browser/ticket';
import { LabelService, KIXObjectService } from '../../../src/core/browser';
import { DateTimeUtil, KIXObjectProperty, Ticket, OrganisationProperty, Organisation, KIXObjectType } from '../../../src/core/model';
import { OrganisationPlaceholderHandler, OrganisationLabelProvider } from '../../../src/core/browser/organisation';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for organisation', () => {

    let organisation: Organisation
    let organisationPlaceholderHandler: OrganisationPlaceholderHandler = new OrganisationPlaceholderHandler();
    before(() => {
        organisation = someTestFunctions.prepareUser();

        const organisationLabelProvider = new OrganisationLabelProvider();
        organisationLabelProvider.getDisplayText = someTestFunctions.changedGetDisplayTextMethod;
        LabelService.getInstance().registerLabelProvider(organisationLabelProvider);
    });

    describe('Replace simple organisation attribute placeholder.', async () => {

        it('Should replace organisation ID placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.ID}>`, organisation);
            expect(text).equal(organisation.ID.toString());
        });

        it('Should replace organisation name placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.NAME}>`, organisation);
            expect(text).equal(organisation.Name);
        });

        it('Should replace organisation number placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.NUMBER}>`, organisation);
            expect(text).equal(organisation.Number);
        });

        it('Should replace organisation url placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.URL}>`, organisation);
            expect(text).equal(organisation.Url);
        });

        it('Should replace organisation street placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.STREET}>`, organisation);
            expect(text).equal(organisation.Street);
        });

        it('Should replace organisation zip placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.ZIP}>`, organisation);
            expect(text).equal(organisation.Zip);
        });

        it('Should replace organisation city placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.CITY}>`, organisation);
            expect(text).equal(organisation.City);
        });

        it('Should replace organisation country placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.COUNTRY}>`, organisation);
            expect(text).equal(organisation.Country);
        });

        it('Should replace organisation comment placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.COMMENT}>`, organisation);
            expect(text).equal(organisation.Comment);
        });

        it('Should replace organisation create by placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${KIXObjectProperty.CREATE_BY}>`, organisation);
            expect(text).equal(`${KIXObjectProperty.CREATE_BY}_Name`);
        });

        it('Should replace organisation change by placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${KIXObjectProperty.CHANGE_BY}>`, organisation);
            expect(text).equal(`${KIXObjectProperty.CHANGE_BY}_Name`);
        });

        it('Should replace organisation valid id placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${KIXObjectProperty.VALID_ID}>`, organisation);
            expect(text).equal(organisation.ValidID.toString());
        });

        it('Should replace organisation valid placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.VALID}>`, organisation);
            expect(text).equal(`${OrganisationProperty.VALID}_Name`);
        });
    });

    describe('Replace complex organisation attribute placeholder (translatable).', async () => {

        it('Should replace organisation create time placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${KIXObjectProperty.CREATE_TIME}>`, organisation);
            const date = await DateTimeUtil.getLocalDateTimeString(organisation.CreateTime, 'en');
            expect(text).equal(date);

            const germanText = await organisationPlaceholderHandler.replace(`<TR_KIX_ORG_${KIXObjectProperty.CREATE_TIME}>`, organisation, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(organisation.CreateTime, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await organisationPlaceholderHandler.replace(`<KIX_ORG_${KIXObjectProperty.CREATE_TIME}>`, organisation, 'de');
            expect(notGermanText).equal(date);
        });

        it('Should replace organisation change time placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_${KIXObjectProperty.CHANGE_TIME}>`, organisation);
            const date = await DateTimeUtil.getLocalDateTimeString(organisation.ChangeTime, 'en');
            expect(text).equal(date);

            const germanText = await organisationPlaceholderHandler.replace(`<TR_KIX_ORG_${KIXObjectProperty.CHANGE_TIME}>`, organisation, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(organisation.ChangeTime, 'de');
            expect(germanText).equal(germanDate);

            const notGermanText = await organisationPlaceholderHandler.replace(`<KIX_ORG_${KIXObjectProperty.CHANGE_TIME}>`, organisation, 'de');
            expect(notGermanText).equal(date);
        });
    });

    describe('Replace dynamic field organisation attribute placeholder.', async () => {

    });

    describe('Replace unknown or emtpy organisation attribute placeholder with empty string.', async () => {

        it('Should replace unknown organisation attribute placeholder', async () => {
            const text = await organisationPlaceholderHandler.replace(`<KIX_ORG_UnknownAttribute>`, organisation);
            expect(text).exist;
            expect(text).equal('');
        });

        it('Should replace empty organisation attribute placeholder', async () => {
            const empty_1 = await organisationPlaceholderHandler.replace(`<KIX_ORG_>`, organisation);
            expect(empty_1).exist;
            expect(empty_1).equal('');

            const empty_2 = await organisationPlaceholderHandler.replace(`<KIX_ORG>`, organisation);
            expect(empty_2).exist;
            expect(empty_2).equal('');
        });
    });

    describe('Replace with organisation placeholder from ticket.', async () => {

        const ticket: Ticket = new Ticket();
        const organisation: Organisation = new Organisation();
        let orgLoadFuntion;
        before(() => {
            organisation.Name = 'Organisation';
            organisation.Number = 'organisation-number';
            ticket.OrganisationID = '2';
            orgLoadFuntion = KIXObjectService.loadObjects;
            KIXObjectService.loadObjects = async (objectType, objectIds: Array<string | number>) => {
                let objects: Organisation[] = [];
                if (objectIds && objectType === KIXObjectType.ORGANISATION) {
                    if (objectIds[0] === ticket.OrganisationID) {
                        objects = [organisation];
                    }
                }
                return objects as any[];
            }
        });

        after(() => {
            KIXObjectService.loadObjects = orgLoadFuntion;
        });

        it('Should replace organisation attribute placeholder from ticket organisation', async () => {
            let ticketPlaceholderHandler: TicketPlaceholderHandler = new TicketPlaceholderHandler();
            const name = await ticketPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.NAME}>`, ticket);
            expect(name).exist;
            expect(name, 'should be name of ticket organisation').equal(organisation.Name);
            const number = await ticketPlaceholderHandler.replace(`<KIX_ORG_${OrganisationProperty.NUMBER}>`, ticket);
            expect(number).exist;
            expect(number, 'should be number of ticket organisation').equal(organisation.Number);
        });
    });
});

class someTestFunctions {
    public static async changedGetDisplayTextMethod(organisation: Organisation, property: string): Promise<string> {
        let displayValue = organisation[property];
        switch (property) {
            case KIXObjectProperty.CHANGE_BY:
            case KIXObjectProperty.CREATE_BY:
            case OrganisationProperty.VALID:
                displayValue = `${property}_Name`;
                break;
            default:
        }
        return typeof displayValue !== 'undefined' && displayValue !== null ? displayValue.toString() : null;
    }

    public static prepareUser(): Organisation {
        const organisation = new Organisation();

        organisation.ID = 2;
        organisation.Number = 'some org number';
        organisation.Name = 'Placeholder'
        organisation.Url = 'www.some-organisation.com';;
        organisation.Street = 'somewhere alley 42';
        organisation.Zip = '01234';
        organisation.City = 'Nowhere';
        organisation.Country = 'Anywhere';
        organisation.ValidID = 1;
        organisation.Comment = 'some comment';
        organisation.CreateTime = '2019-05-30 08:45:30';
        organisation.CreateBy = 1;
        organisation.ChangeTime = '2019-06-05 10:45:30';
        organisation.ChangeBy = 2;

        return organisation;
    }
}
