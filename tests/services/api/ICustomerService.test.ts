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
});

function buildCustomerResponse(id: string): CustomerResponse {
    const response = new CustomerResponse();
    response.Customer = new Customer();
    response.Customer.CustomerID = id;
    return response;
}