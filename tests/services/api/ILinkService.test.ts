/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    LinkResponse,
    LinksResponse,
    CreateLink,
    CreateLinkRequest,
    CreateLinkResponse
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { Link } from '@kix/core/dist/model';
import { ILinkService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/links";

describe('Link Service', () => {
    let nockScope;
    let linkService: ILinkService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        linkService = container.getDIContainer().get<ILinkService>("ILinkService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(linkService).not.undefined;
    });

    describe('Create a valid request to retrieve link types', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/types')
                .reply(200, {
                    LinkType: []
                });
        });

        it('should return a list of link types.', async () => {
            const linkTypes = await linkService.getLinkTypes('')
            expect(linkTypes).not.undefined;
            expect(linkTypes).be.an('array');
        });

    });

    describe('Create a valid request to retrieve a link.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildLinkResponse(12345));
        });

        it('should return a link.', async () => {
            const link: Link = await linkService.getLink('', 12345)
            expect(link).not.undefined;
            expect(link.ID).equal(12345);
        });
    });

    describe('Get multiple links', () => {
        describe('Create a valid request to retrieve all links.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildLinksResponse(4));
            });

            it('should return a list of links.', async () => {
                const link: Link[] = await linkService.getLinks('');
                expect(link).not.undefined;
                expect(link).an('array');
                expect(link).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 links', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildLinksResponse(3));
            });

            it('should return a limited list of 3 links.', async () => {
                const links: Link[] = await linkService.getLinks('', 3);
                expect(links).not.undefined;
                expect(links).an('array');
                expect(links).not.empty;
                expect(links.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of links.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildLinksResponse(2));
            });

            it('should return a sorted list of links.', async () => {
                const links: Link[] = await linkService.getLinks('', null, SortOrder.DOWN);
                expect(links).not.undefined;
                expect(links).an('array');
                expect(links).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of links which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildLinksResponse(3));
            });

            it('should return a list of links filtered by changed after.', async () => {
                const links: Link[] = await linkService.getLinks('', null, null, "20170815");
                expect(links).not.undefined;
                expect(links).an('array');
                expect(links).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of links which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildLinksResponse(6));
            });

            it('should return a limited list of links filtered by changed after.', async () => {
                const links: Link[] = await linkService.getLinks('', 6, null, "20170815");
                expect(links).not.undefined;
                expect(links).an('array');
                expect(links.length).equal(6);
                expect(links).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of links', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildLinksResponse(6));
            });

            it('should return a limited, sorted list of links.', async () => {
                const links: Link[] = await linkService.getLinks('', 6, SortOrder.UP);
                expect(links).not.undefined;
                expect(links).an('array');
                expect(links.length).equal(6);
                expect(links).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of links which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildLinksResponse(4));
            });

            it('should return a sorted list of links filtered by changed after.', async () => {
                const links: Link[] = await linkService.getLinks('', null, SortOrder.UP, "20170815");
                expect(links).not.undefined;
                expect(links).an('array');
                expect(links).not.empty;
            });
        });
    });

    describe('Create link', () => {
        describe('Create a valid request to create a new link.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateLinkRequest(new CreateLink('', '', '', '', '')))
                    .reply(200, buildCreateLinkResponse(123456));
            });

            it('should return a the id of the new link.', async () => {
                const userId = await linkService.createLink('', new CreateLink('', '', '', '', ''));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateLinkRequest(new CreateLink('', '', '', '', '')))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await linkService.createLink('', new CreateLink('', '', '', '', ''))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete link', () => {

        describe('Create a valid request to delete a link', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await linkService.deleteLink('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a link.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await linkService.deleteLink('', 123456)
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

function buildLinkResponse(id: number): LinkResponse {
    const response = new LinkResponse();
    response.Link = new Link();
    response.Link.ID = id;
    return response;
}

function buildLinksResponse(linkCount: number): LinksResponse {
    const response = new LinksResponse();
    for (let i = 0; i < linkCount; i++) {
        response.Link.push(new Link());
    }
    return response;
}

function buildCreateLinkResponse(id: number): CreateLinkResponse {
    const response = new CreateLinkResponse();
    response.LinkID = id;
    return response;
}
