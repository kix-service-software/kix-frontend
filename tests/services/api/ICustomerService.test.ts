/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    CustomerResponse,
    CustomersResponse,
    CreateCustomer,
    CreateCustomerRequest,
    CreateCustomerResponse,
    UpdateCustomer,
    UpdateCustomerRequest,
    UpdateCustomerResponse
} from '@kix/core/dist/api';

import { Customer, SortOrder } from '@kix/core/dist/model';
import { ICustomerService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/customers';

describe('Customer Service', () => {
    let nockScope;
    let customerService: ICustomerService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        customerService = container.getDIContainer().get<ICustomerService>('ICustomerService');
        configurationService = container.getDIContainer().get<IConfigurationService>('IConfigurationService');
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(customerService).not.undefined;
    });

    describe('Create a valid request to retrieve a customer.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildCustomerResponse('12345'));
        });

        it('should return a customer.', async () => {
            const customer: Customer = await customerService.getCustomer('', '12345')
            expect(customer).not.undefined;
            expect(customer.CustomerID).equal('12345');
        });
    });

    describe('Get multiple customers', () => {
        describe('Create a valid request to retrieve all customers.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildCustomersResponse(4));
            });

            it('should return a list of customers.', async () => {
                const customer: Customer[] = await customerService.getCustomers('');
                expect(customer).not.undefined;
                expect(customer).an('array');
                expect(customer).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 customers', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildCustomersResponse(3));
            });

            it('should return a limited list of 3 customers.', async () => {
                const customers: Customer[] = await customerService.getCustomers('', 3);
                expect(customers).not.undefined;
                expect(customers).an('array');
                expect(customers).not.empty;
                expect(customers.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of customers.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildCustomersResponse(2));
            });

            it('should return a sorted list of customers.', async () => {
                const customers: Customer[] = await customerService.getCustomers('', null, SortOrder.DOWN);
                expect(customers).not.undefined;
                expect(customers).an('array');
                expect(customers).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of customers which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildCustomersResponse(3));
            });

            it('should return a list of customers filtered by changed after.', async () => {
                const customers: Customer[] = await customerService.getCustomers('', null, null, '20170815');
                expect(customers).not.undefined;
                expect(customers).an('array');
                expect(customers).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of customers which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildCustomersResponse(6));
            });

            it('should return a limited list of customers filtered by changed after.', async () => {
                const customers: Customer[] = await customerService.getCustomers('', 6, null, '20170815');
                expect(customers).not.undefined;
                expect(customers).an('array');
                expect(customers.length).equal(6);
                expect(customers).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of customers', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildCustomersResponse(6));
            });

            it('should return a limited, sorted list of customers.', async () => {
                const customers: Customer[] = await customerService.getCustomers('', 6, SortOrder.UP);
                expect(customers).not.undefined;
                expect(customers).an('array');
                expect(customers.length).equal(6);
                expect(customers).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of customers which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildCustomersResponse(4));
            });

            it('should return a sorted list of customers filtered by changed after.', async () => {
                const customers: Customer[] = await customerService.getCustomers('', null, SortOrder.UP, '20170815');
                expect(customers).not.undefined;
                expect(customers).an('array');
                expect(customers).not.empty;
            });
        });
    });

    describe('Create customer', () => {
        describe('Create a valid request to create a new customer.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateCustomerRequest('sourceID', new CreateCustomer('customer', 'company')))
                    .reply(200, buildCreateCustomerResponse('123456'));
            });

            it('should return a the id of the new customer.', async () => {
                const userId = await customerService.createCustomer('', 'sourceID', new CreateCustomer('customer', 'company'));
                expect(userId).equal('123456');
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateCustomerRequest('sourceId', new CreateCustomer('customer', 'company')))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await customerService.createCustomer('', 'sourceId', new CreateCustomer('customer', 'company'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update customer', () => {
        describe('Create a valid request to update an existing customer.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                        new UpdateCustomerRequest(new UpdateCustomer('customer', 'comapny')))
                    .reply(200, buildUpdateCustomerResponse('123456'));
            });

            it('should return the id of the customer.', async () => {
                const userId = await customerService.updateCustomer('', '123456', new UpdateCustomer('customer', 'comapny'));
                expect(userId).equal('123456');
            });

        });

        describe('Create a invalid request to update an existing customer.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                        new UpdateCustomerRequest(new UpdateCustomer('customer', 'company')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await customerService.updateCustomer('', '123456', new UpdateCustomer('customer', 'company'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete customer', () => {

        describe('Create a valid request to delete a customer', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await customerService.deleteCustomer('', '123456').then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a customer.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await customerService.deleteCustomer('', '123456')
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

function buildCustomerResponse(id: string): CustomerResponse {
    const response = new CustomerResponse();
    response.Customer = new Customer();
    response.Customer.CustomerID = id;
    return response;
}

function buildCustomersResponse(customerCount: number): CustomersResponse {
    const response = new CustomersResponse();
    for (let i = 0; i < customerCount; i++) {
        response.Customer.push(new Customer());
    }
    return response;
}

function buildCreateCustomerResponse(id: string): CreateCustomerResponse {
    const response = new CreateCustomerResponse();
    response.CustomerID = id;
    return response;
}

function buildUpdateCustomerResponse(id: string): UpdateCustomerResponse {
    const response = new UpdateCustomerResponse();
    response.CustomerID = id;
    return response;
}