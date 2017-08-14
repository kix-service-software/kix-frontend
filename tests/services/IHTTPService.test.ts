import { HttpError } from './../../src/model/http/HttpError';
import { HttpService, IHttpService } from './../../src/services/';
/* tslint:disable no-var-requires no-unused-expression */
import chaiAsPromised = require('chai-as-promised');
import MockAdapter = require('axios-mock-adapter');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const httpService: IHttpService = new HttpService();
const axios = require('axios');
const mock = new MockAdapter(axios);

const apiURL = require('../../server.config.json').BACKEND_API_URL;

describe('HTTP Service', () => {
    describe('HTTP Service - GET Requests', () => {
        before((done) => {
            mock.onGet(apiURL + '/testGet')
                .reply(200, {});

            this.testObject = {
                id: '1234567890',
                name: 'test-object',
                description: 'test-object-description'
            };
            mock.onGet(apiURL + '/testGetObject')
                .reply(200, this.testObject);

            this.parameterObject = {
                id: "12345"
            };
            mock.onGet(apiURL + '/object', { params: { id: '12345' } })
                .reply(200, this.parameterObject);

            done();
        });

        it('should return an empty object', async () => {
            const res = await httpService.get('testGet');
            expect(res).not.to.be.undefined;
            expect(res).to.deep.equal({});
        });

        it('should return a object with properties.', async () => {
            const res = await httpService.get("testGetObject");
            expect(res).to.deep.equal(this.testObject);
        });

        it('should return a correct http error if resource not exists', async () => {
            const res = await httpService.get('unknownResource')
                .catch((err: HttpError) => {
                    expect(err).not.to.be.undefined;
                    expect(err).to.be.instanceof(HttpError);
                    expect(err.status).to.be.equal(404);
                });
        });

        it('should return a object with the values of the query parameter.', async () => {
            const res = await httpService.get('object', { id: '12345' });
            expect(res).to.deep.equal(this.parameterObject);
        });
    });

    describe('HTTP Service - POST Requests', () => {
        before((done) => {
            mock.onPost(apiURL + '/post', { name: 'testobject' })
                .reply(201, 'Object#12345');

            done();
        });

        it('should return the id of the new created object', async () => {
            const response: string = await httpService.post("post", { name: 'testobject' });
            expect(response).not.to.be.undefined;
            expect(response).to.be.an('string');
            expect(response).to.be.equal('Object#12345');
        });

        it('should return a correct http error if resource not exists', async () => {
            const res = await httpService.post('unknownResource', {})
                .catch((err: HttpError) => {
                    expect(err).not.to.be.undefined;
                    expect(err).to.be.instanceof(HttpError);
                    expect(err.status).to.be.equal(404);
                });
        });
    });

    describe('HTTP Service - PUT Requests', () => {
        before((done) => {
            mock.onPut(apiURL + '/put/12345', { name: 'testobject' })
                .reply(200, 'Object#12345');

            done();
        });

        it('should return the id of the updated object', async () => {
            const response: string = await httpService.put("put/12345", { name: 'testobject' });
            expect(response).not.to.be.undefined;
            expect(response).to.be.an('string');
            expect(response).to.be.equal('Object#12345');
        });

        it('should return a correct http error if resource not exists', async () => {
            const res = await httpService.put('unknownResource', {})
                .catch((err: HttpError) => {
                    expect(err).not.to.be.undefined;
                    expect(err).to.be.instanceof(HttpError);
                    expect(err.status).to.be.equal(404);
                });
        });
    });

    describe('HTTP Service - PATCH Requests', () => {
        before((done) => {
            mock.onPatch(apiURL + '/patch/12345')
                .reply(204, 'Object#12345');

            done();
        });

        it('should return the id of the patched object.', async () => {
            const response: string = await httpService.patch("patch/12345", { name: 'testobject' });
            expect(response).not.to.be.undefined;
            expect(response).to.be.an('string');
            expect(response).to.be.equal('Object#12345');
        });

        it('should return a correct http error if resource not exists', async () => {
            const res = await httpService.patch('unknownResource', { name: 'testobject' })
                .catch((err: HttpError) => {
                    expect(err).not.to.be.undefined;
                    expect(err).to.be.instanceof(HttpError);
                    expect(err.status).to.be.equal(404);
                });
        });
    });

    describe('HTTP Service - DELETE Requests', () => {
        before((done) => {
            mock.onDelete(apiURL + '/delete/12345')
                .reply(204);

            done();
        });

        it('should return nothing if object is deleted', async () => {
            const response: string = await httpService.delete("delete/12345");
            expect(response).to.be.undefined;
        });

        it('should return a correct http error if resource not exists', async () => {
            const res = await httpService.delete('unknownResource')
                .catch((err: HttpError) => {
                    expect(err).not.to.be.undefined;
                    expect(err).to.be.instanceof(HttpError);
                    expect(err.status).to.be.equal(404);
                });
        });
    });
});
