/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    ContactResponse,
    ContactsResponse,
    CreateContact,
    CreateContactRequest,
    CreateContactResponse,
    UpdateContact,
    UpdateContactRequest,
    UpdateContactResponse
} from '@kix/core/dist/api';

import { Contact, SortOrder } from '@kix/core/dist/model';
import { IContactService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/contacts';

describe('Contact Service', () => {
    let nockScope;
    let contactService: IContactService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        contactService = container.getDIContainer().get<IContactService>('IContactService');
        configurationService = container.getDIContainer().get<IConfigurationService>('IConfigurationService');
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(contactService).not.undefined;
    });

    describe('Create a valid request to retrieve a contact.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildContactResponse('12345'));
        });

        it('should return a contact.', async () => {
            const contact: Contact = await contactService.getContact('', '12345')
            expect(contact).not.undefined;
            expect(contact.ContactID).equal('12345');
        });
    });

});

function buildContactResponse(id: string): ContactResponse {
    const response = new ContactResponse();
    response.Contact = new Contact();
    response.Contact.ContactID = id;
    return response;
}