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
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { Contact } from '@kix/core/dist/model';
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

    describe('Get multiple contacts', () => {
        describe('Create a valid request to retrieve all contacts.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildContactsResponse(4));
            });

            it('should return a list of contacts.', async () => {
                const contact: Contact[] = await contactService.getContacts('');
                expect(contact).not.undefined;
                expect(contact).an('array');
                expect(contact).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 contacts', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildContactsResponse(3));
            });

            it('should return a limited list of 3 contacts.', async () => {
                const contacts: Contact[] = await contactService.getContacts('', 3);
                expect(contacts).not.undefined;
                expect(contacts).an('array');
                expect(contacts).not.empty;
                expect(contacts.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of contacts.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildContactsResponse(2));
            });

            it('should return a sorted list of contacts.', async () => {
                const contacts: Contact[] = await contactService.getContacts('', null, SortOrder.DOWN);
                expect(contacts).not.undefined;
                expect(contacts).an('array');
                expect(contacts).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of contacts witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildContactsResponse(3));
            });

            it('should return a list of contacts filtered by changed after.', async () => {
                const contacts: Contact[] = await contactService.getContacts('', null, null, '20170815');
                expect(contacts).not.undefined;
                expect(contacts).an('array');
                expect(contacts).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of contacts witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildContactsResponse(6));
            });

            it('should return a limited list of contacts filtered by changed after.', async () => {
                const contacts: Contact[] = await contactService.getContacts('', 6, null, '20170815');
                expect(contacts).not.undefined;
                expect(contacts).an('array');
                expect(contacts.length).equal(6);
                expect(contacts).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of contacts', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildContactsResponse(6));
            });

            it('should return a limited, sorted list of contacts.', async () => {
                const contacts: Contact[] = await contactService.getContacts('', 6, SortOrder.UP);
                expect(contacts).not.undefined;
                expect(contacts).an('array');
                expect(contacts.length).equal(6);
                expect(contacts).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of contacts witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildContactsResponse(4));
            });

            it('should return a sorted list of contacts filtered by changed after.', async () => {
                const contacts: Contact[] = await contactService.getContacts('', null, SortOrder.UP, '20170815');
                expect(contacts).not.undefined;
                expect(contacts).an('array');
                expect(contacts).not.empty;
            });
        });
    });

    describe('Create contact', () => {
        describe('Create a valid request to create a new contact.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateContactRequest('sourceID', new CreateContact('login', 'mail', 'firstName', 'lastName', 'userId')))
                    .reply(200, buildCreateContactResponse('123456'));
            });

            it('should return a the id of the new contact.', async () => {
                const userId = await contactService.createContact('', 'sourceID', new CreateContact('login', 'mail', 'firstName', 'lastName', 'userId'));
                expect(userId).equal('123456');
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateContactRequest('sourceId', new CreateContact('login', 'mail', 'firstName', 'lastName', 'userId')))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await contactService.createContact('', 'sourceId', new CreateContact('login', 'mail', 'firstName', 'lastName', 'userId'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update contact', () => {
        describe('Create a valid request to update an existing contact.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateContactRequest(new UpdateContact('contact', 'comapny')))
                    .reply(200, buildUpdateContactResponse('123456'));
            });

            it('should return the id of the contact.', async () => {
                const userId = await contactService.updateContact('', '123456', new UpdateContact('contact', 'comapny'));
                expect(userId).equal('123456');
            });

        });

        describe('Create a invalid request to update an existing contact.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateContactRequest(new UpdateContact('contact', 'company')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await contactService.updateContact('', '123456', new UpdateContact('contact', 'company'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete contact', () => {

        describe('Create a valid request to delete a contact', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await contactService.deleteContact('', '123456').then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a contact.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await contactService.deleteContact('', '123456')
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });

    });

});

function buildContactResponse(id: string): ContactResponse {
    const response = new ContactResponse();
    response.Contact = new Contact();
    response.Contact.ContactID = id;
    return response;
}

function buildContactsResponse(contactCount: number): ContactsResponse {
    const response = new ContactsResponse();
    for (let i = 0; i < contactCount; i++) {
        response.Contact.push(new Contact());
    }
    return response;
}

function buildCreateContactResponse(id: string): CreateContactResponse {
    const response = new CreateContactResponse();
    response.ContactID = id;
    return response;
}

function buildUpdateContactResponse(id: string): UpdateContactResponse {
    const response = new UpdateContactResponse();
    response.ContactID = id;
    return response;
}