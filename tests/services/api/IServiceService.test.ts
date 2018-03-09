/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    ServiceResponse,
    ServicesResponse,
    CreateService,
    CreateServiceRequest,
    CreateServiceResponse,
    UpdateService,
    UpdateServiceRequest,
    UpdateServiceResponse
} from '@kix/core/dist/api';

import { Service, SortOrder } from '@kix/core/dist/model';
import { IServiceService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/services";

describe('Service Service', () => {
    let nockScope;
    let serviceService: IServiceService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        serviceService = container.getDIContainer().get<IServiceService>("IServiceService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(serviceService).not.undefined;
    });

    describe('Get multiple services', () => {
        describe('Create a valid request to retrieve all services.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query((query) => true)
                    .reply(200, buildServicesResponse(4));
            });

            it('should return a list of services.', async () => {
                const service: Service[] = await serviceService.getServices('');
                expect(service).not.undefined;
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