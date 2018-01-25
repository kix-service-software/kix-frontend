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
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { Service } from '@kix/core/dist/model';
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

    describe('Create a valid request to retrieve a service.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildServiceResponse(12345));
        });

        it('should return a service.', async () => {
            const service: Service = await serviceService.getService('', 12345)
            expect(service).not.undefined;
            expect(service.ServiceID).equal(12345);
        });
    });

    describe('Get multiple services', () => {
        describe('Create a valid request to retrieve all services.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildServicesResponse(4));
            });

            it('should return a list of services.', async () => {
                const service: Service[] = await serviceService.getServices('');
                expect(service).not.undefined;
                expect(service).an('array');
                expect(service).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 services', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildServicesResponse(3));
            });

            it('should return a limited list of 3 services.', async () => {
                const services: Service[] = await serviceService.getServices('', 3);
                expect(services).not.undefined;
                expect(services).an('array');
                expect(services).not.empty;
                expect(services.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of services.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildServicesResponse(2));
            });

            it('should return a sorted list of services.', async () => {
                const services: Service[] = await serviceService.getServices('', null, SortOrder.DOWN);
                expect(services).not.undefined;
                expect(services).an('array');
                expect(services).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of services which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildServicesResponse(3));
            });

            it('should return a list of services filtered by changed after.', async () => {
                const services: Service[] = await serviceService.getServices('', null, null, "20170815");
                expect(services).not.undefined;
                expect(services).an('array');
                expect(services).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of services which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildServicesResponse(6));
            });

            it('should return a limited list of services filtered by changed after.', async () => {
                const services: Service[] = await serviceService.getServices('', 6, null, "20170815");
                expect(services).not.undefined;
                expect(services).an('array');
                expect(services.length).equal(6);
                expect(services).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of services', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildServicesResponse(6));
            });

            it('should return a limited, sorted list of services.', async () => {
                const services: Service[] = await serviceService.getServices('', 6, SortOrder.UP);
                expect(services).not.undefined;
                expect(services).an('array');
                expect(services.length).equal(6);
                expect(services).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of services which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildServicesResponse(4));
            });

            it('should return a sorted list of services filtered by changed after.', async () => {
                const services: Service[] = await serviceService.getServices('', null, SortOrder.UP, "20170815");
                expect(services).not.undefined;
                expect(services).an('array');
                expect(services).not.empty;
            });
        });
    });

    describe('Create service', () => {
        describe('Create a valid request to create a new service.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateServiceRequest(new CreateService('service', 12345)))
                    .reply(200, buildCreateServiceResponse(123456));
            });

            it('should return a the id of the new service.', async () => {
                const userId = await serviceService.createService('', new CreateService('service', 12345));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateServiceRequest(new CreateService('service', 12345)))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await serviceService.createService('', new CreateService('service', 12345))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update service', () => {
        describe('Create a valid request to update an existing service.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateServiceRequest(new UpdateService('service')))
                    .reply(200, buildUpdateServiceResponse(123456));
            });

            it('should return the id of the service.', async () => {
                const userId = await serviceService.updateService('', 123456, new UpdateService('service'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing service.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateServiceRequest(new UpdateService('service')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await serviceService.updateService('', 123456, new UpdateService('service'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete service', () => {

        describe('Create a valid request to delete a service', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await serviceService.deleteService('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a service.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await serviceService.deleteService('', 123456)
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

function buildServiceResponse(id: number): ServiceResponse {
    const response = new ServiceResponse();
    response.Service = new Service();
    response.Service.ServiceID = id;
    return response;
}

function buildServicesResponse(groupCount: number): ServicesResponse {
    const response = new ServicesResponse();
    for (let i = 0; i < groupCount; i++) {
        response.Service.push(new Service());
    }
    return response;
}

function buildCreateServiceResponse(id: number): CreateServiceResponse {
    const response = new CreateServiceResponse();
    response.ServiceID = id;
    return response;
}

function buildUpdateServiceResponse(id: number): UpdateServiceResponse {
    const response = new UpdateServiceResponse();
    response.ServiceID = id;
    return response;
}