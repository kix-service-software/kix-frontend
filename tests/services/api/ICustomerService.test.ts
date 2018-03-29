/* tslint:disable*/
import { CustomerResponse } from '@kix/core/dist/api';
import { Customer } from '@kix/core/dist/model';
import { IConfigurationService, ICustomerService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ServiceContainer } from '@kix/core/dist/common';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/customers';

describe('Customer Service', () => {
    let nockScope;
    let customerService: ICustomerService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        require('../../TestSetup');
        const nock = require('nock');
        customerService = ServiceContainer.getInstance().getClass<ICustomerService>('ICustomerService');
        configurationService = ServiceContainer.getInstance().getClass<IConfigurationService>('IConfigurationService');
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