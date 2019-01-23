/* tslint:disable*/
import { ConfigurationService, ServiceService } from '../../src/core/services';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Service } from '../../src/core/model';
import { ServicesResponse } from '../../src/core/api';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/services";

describe('Service Service', () => {
    let nockScope;
    let apiURL: string;

    before(async () => {
        require('../TestSetup');
        const nock = require('nock');
        apiURL = ConfigurationService.getInstance().getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('Service instance is registered in container.', () => {
        expect(ServiceService.getInstance()).exist;
    });

    describe('Get multiple services.', () => {
        describe('Create a valid request to retrieve all services.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query((query) => true)
                    .reply(200, buildServicesResponse(4));
            });

            it('Should return a list of services.', async () => {
                const service: Service[] = await ServiceService.getInstance().getServices('');
                expect(service).exist;
                expect(service).an('array');
                expect(service).not.empty;
            });

        });
    });
});

function buildServicesResponse(groupCount: number): ServicesResponse {
    const response = new ServicesResponse();
    for (let i = 0; i < groupCount; i++) {
        response.Service.push(new Service());
    }
    return response;
}
