/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    SignatureResponse,
    SignaturesResponse,
    CreateSignature,
    CreateSignatureRequest,
    CreateSignatureResponse,
    UpdateSignature,
    UpdateSignatureRequest,
    UpdateSignatureResponse
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { Signature } from '@kix/core/dist/model';
import { ISignatureService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/signatures";

describe('Signature Service', () => {
    let nockScope;
    let signatureService: ISignatureService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        signatureService = container.getDIContainer().get<ISignatureService>("ISignatureService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(signatureService).not.undefined;
    });

    describe('Create a valid request to retrieve a signature.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildSignatureResponse(12345));
        });

        it('should return a signature.', async () => {
            const signature: Signature = await signatureService.getSignature('', 12345)
            expect(signature).not.undefined;
            expect(signature.ID).equal(12345);
        });
    });

    describe('Get multiple signatures', () => {
        describe('Create a valid request to retrieve all signatures.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildSignaturesResponse(4));
            });

            it('should return a list of signatures.', async () => {
                const signature: Signature[] = await signatureService.getSignatures('');
                expect(signature).not.undefined;
                expect(signature).an('array');
                expect(signature).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 signatures', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildSignaturesResponse(3));
            });

            it('should return a limited list of 3 signatures.', async () => {
                const signatures: Signature[] = await signatureService.getSignatures('', 3);
                expect(signatures).not.undefined;
                expect(signatures).an('array');
                expect(signatures).not.empty;
                expect(signatures.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of signatures.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildSignaturesResponse(2));
            });

            it('should return a sorted list of signatures.', async () => {
                const signatures: Signature[] = await signatureService.getSignatures('', null, SortOrder.DOWN);
                expect(signatures).not.undefined;
                expect(signatures).an('array');
                expect(signatures).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of signatures which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildSignaturesResponse(3));
            });

            it('should return a list of signatures filtered by changed after.', async () => {
                const signatures: Signature[] = await signatureService.getSignatures('', null, null, "20170815");
                expect(signatures).not.undefined;
                expect(signatures).an('array');
                expect(signatures).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of signatures which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildSignaturesResponse(6));
            });

            it('should return a limited list of signatures filtered by changed after.', async () => {
                const signatures: Signature[] = await signatureService.getSignatures('', 6, null, "20170815");
                expect(signatures).not.undefined;
                expect(signatures).an('array');
                expect(signatures.length).equal(6);
                expect(signatures).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of signatures', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildSignaturesResponse(6));
            });

            it('should return a limited, sorted list of signatures.', async () => {
                const signatures: Signature[] = await signatureService.getSignatures('', 6, SortOrder.UP);
                expect(signatures).not.undefined;
                expect(signatures).an('array');
                expect(signatures.length).equal(6);
                expect(signatures).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of signatures which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildSignaturesResponse(4));
            });

            it('should return a sorted list of signatures filtered by changed after.', async () => {
                const signatures: Signature[] = await signatureService.getSignatures('', null, SortOrder.UP, "20170815");
                expect(signatures).not.undefined;
                expect(signatures).an('array');
                expect(signatures).not.empty;
            });
        });
    });

    describe('Create signature', () => {
        describe('Create a valid request to create a new signature.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateSignatureRequest(new CreateSignature('signature', 'text')))
                    .reply(200, buildCreateSignatureResponse(123456));
            });

            it('should return a the id of the new signature.', async () => {
                const userId = await signatureService.createSignature('', new CreateSignature('signature', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateSignatureRequest(new CreateSignature('signature', 'text')))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await signatureService.createSignature('', new CreateSignature('signature', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update signature', () => {
        describe('Create a valid request to update an existing signature.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateSignatureRequest(new UpdateSignature('signature', 'text')))
                    .reply(200, buildUpdateSignatureResponse(123456));
            });

            it('should return the id of the signature.', async () => {
                const userId = await signatureService.updateSignature('', 123456, new UpdateSignature('signature', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing signature.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateSignatureRequest(new UpdateSignature('signature', 'text')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await signatureService.updateSignature('', 123456, new UpdateSignature('signature', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete signature', () => {

        describe('Create a valid request to delete a signature', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await signatureService.deleteSignature('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a signature.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await signatureService.deleteSignature('', 123456)
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

function buildSignatureResponse(id: number): SignatureResponse {
    const response = new SignatureResponse();
    response.Signature = new Signature();
    response.Signature.ID = id;
    return response;
}

function buildSignaturesResponse(signatureCount: number): SignaturesResponse {
    const response = new SignaturesResponse();
    for (let i = 0; i < signatureCount; i++) {
        response.Signature.push(new Signature());
    }
    return response;
}

function buildCreateSignatureResponse(id: number): CreateSignatureResponse {
    const response = new CreateSignatureResponse();
    response.SignatureID = id;
    return response;
}

function buildUpdateSignatureResponse(id: number): UpdateSignatureResponse {
    const response = new UpdateSignatureResponse();
    response.SignatureID = id;
    return response;
}