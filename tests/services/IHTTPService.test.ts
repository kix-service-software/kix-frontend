/* tslint:disable no-var-requires no-unused-expression */
import { HTTPService, IHTTPService } from './../../src/services/';
import chaiAsPromised = require('chai-as-promised');
import MockAdapter = require('axios-mock-adapter');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const httpService: HTTPService = new HTTPService();
const axios = require('axios');
const mock = new MockAdapter(axios);

const apiURL = require('../../server.config.json').BACKEND_API_URL;

describe('HTTP Service', () => {
    describe('HTTP Service - GET Requests', () => {
        before((done) => {
            mock.onGet(apiURL + '/testGet').reply(200, {});

            this.testObject = {
                id: '1234567890',
                name: 'test-object',
                description: 'test-object-description'
            };
            mock.onGet(apiURL + '/testGetObject').reply(200, this.testObject);

            this.parameterObject = {
                id: "12345"
            };
            mock.onGet(apiURL + '/object', { params: { id: '12345' } }).reply(200, this.parameterObject);

            done();
        });

        it('should response an empty object', async () => {
            const res = await httpService.get('testGet');
            expect(res).not.to.be.undefined;
            expect(res).to.deep.equal({});
        });

        it('should response a object with properties.', async () => {
            const res = await httpService.get("testGetObject");
            expect(res).to.deep.equal(this.testObject);
        });

        it('should response with a error if resource not exists', async () => {
            const res = await httpService.get('unknownResource')
                .catch((err) => {
                    expect(err).not.to.be.undefined;
                });
        });

        it('should response a object with the values of the query parameter.', async () => {
            const res = await httpService.get('object', { id: '12345' });
            expect(res).to.deep.equal(this.parameterObject);
        });
    });
});
