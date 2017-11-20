/* tslint:disable no-var-requires no-unused-expression */
import { container } from '../../../src/Container';
import { IHttpService, IConfigurationService } from '@kix/core/dist/services';
import { HttpError } from '@kix/core/dist/api';
import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('HTTP Service', () => {
    let nockScope;
    let httpService: IHttpService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        httpService = container.getDIContainer().get<IHttpService>("IHttpService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(httpService).not.undefined;
    });

    describe('GET Requests', () => {

        before(() => {
            nockScope
                .get('/testGet')
                .reply(200, {});

            this.testObject = {
                id: '1234567890',
                name: 'test-object',
                description: 'test-object-description'
            };

            nockScope
                .get('/testGetObject')
                .reply(200, this.testObject);

            this.parameterObject = {
                id: "12345"
            };
            nockScope
                .get('/object')
                .query({ id: '12345' })
                .reply(200, this.parameterObject);

            nockScope
                .get('/unknownResource')
                .reply(404);
        });

        it('should return an empty object', async () => {
            const res = await httpService.get('testGet', {});
            expect(res).not.undefined;
            expect(res).deep.equal({});
        });

        it('should return a object with properties.', async () => {
            const res = await httpService.get("testGetObject", {});
            expect(res).deep.equal(this.testObject);
        });

        it('should return a object with the values of the query parameter.', async () => {
            const res = await httpService.get('object', { id: '12345' });
            expect(res).deep.equal(this.parameterObject);
        });

        it('should return a correct http error if resource not exists', async () => {
            const res = await httpService.get('unknownResource', {})
                .catch((err: HttpError) => {
                    expect(err).not.undefined;
                    expect(err).instanceof(HttpError);
                    expect(err.status).equal(404);
                });
        });
    });

    describe('POST Requests', () => {
        before(() => {
            nockScope
                .post('/post', {
                    name: 'testobject'
                })
                .reply(201, 'Object#12345');

            nockScope
                .post('/unknownResource')
                .reply(404);
        });

        it('should return the id of the new created object', async () => {
            const response: string = await httpService.post<string>("post", { name: 'testobject' });
            expect(response).not.undefined;
            expect(response).an('string');
            expect(response).equal('Object#12345');
        });

        it('should return a correct http error if resource not exists', async () => {
            const res = await httpService.post('unknownResource', {})
                .catch((err: HttpError) => {
                    expect(err).not.undefined;
                    expect(err).instanceof(HttpError);
                    expect(err.status).equal(404);
                });
        });
    });

    describe('PUT Requests', () => {
        before(() => {
            nockScope
                .put('/put/12345', {
                    name: 'testobject'
                })
                .reply(200, 'Object#12345');

            nockScope
                .put('/unknownResource')
                .reply(404);
        });

        it('should return the id of the updated object', async () => {
            const response: string = await httpService.put<string>("put/12345", { name: 'testobject' });
            expect(response).not.undefined;
            expect(response).an('string');
            expect(response).equal('Object#12345');
        });

        it('should return a correct http error if resource not exists', async () => {
            const res = await httpService.put('unknownResource', {})
                .catch((err: HttpError) => {
                    expect(err).not.undefined;
                    expect(err).instanceof(HttpError);
                    expect(err.status).equal(404);
                });
        });
    });

    describe('PATCH Requests', () => {
        before(() => {
            nockScope
                .patch('/patch/12345', {
                    name: 'testobject'
                })
                .reply(200, 'Object#12345');

            nockScope
                .patch('/unknownResource', {
                    name: 'testobject'
                })
                .reply(404);
        });

        it('should return the id of the patched object.', async () => {
            const response: string = await httpService.patch<string>("patch/12345", { name: 'testobject' });
            expect(response).not.undefined;
            expect(response).an('string');
            expect(response).equal('Object#12345');
        });

        it('should return a correct http error if resource not exists', async () => {
            const res = await httpService.patch('unknownResource', { name: 'testobject' })
                .catch((err: HttpError) => {
                    expect(err).not.undefined;
                    expect(err).instanceof(HttpError);
                    expect(err.status).equal(404);
                });
        });
    });

    describe('DELETE Requests', () => {
        before(() => {
            nockScope
                .delete('/delete/12345')
                .reply(204);

            nockScope
                .delete('/unknownResource')
                .reply(404);
        });

        it('should return nothing if object is deleted', async () => {
            const response = await httpService.delete("delete/12345");
            expect(response).undefined;
        });

        it('should return a correct http error if resource not exists', async () => {
            const res = await httpService.delete('unknownResource')
                .catch((err: HttpError) => {
                    expect(err).not.undefined;
                    expect(err).instanceof(HttpError);
                    expect(err.status).equal(404);
                });
        });
    });
});
