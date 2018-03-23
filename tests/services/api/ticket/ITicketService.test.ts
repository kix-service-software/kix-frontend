/* tslint:disable*/
import {
    CreateArticle,
    CreateArticleAttachmentRequest,
    CreateArticleRequest,
    CreateAttachment,
    CreateTicket,
    CreateTicketRequest,
    CreateTicketResponse,
    HttpError,
    TicketResponse,
    UpdateTicket,
    UpdateTicketRequest,
    UpdateTicketResponse
} from '@kix/core/dist/api';

import { Article, Ticket, SortOrder } from '@kix/core/dist/model';
import { IConfigurationService, ITicketService } from '@kix/core/dist/services';

import { container } from '../../../../src/Container';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/tickets";

describe('Ticket Service', () => {
    let nockScope;
    let ticketService: ITicketService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        ticketService = container.getDIContainer().get<ITicketService>("ITicketService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(ticketService).not.undefined;
    });

    describe('Create a valid request to retrieve a ticket.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .query({
                    fields: 'Ticket.*',
                    include: 'TimeUnits,DynamicFields,Links',
                    expand: 'Links'
                })
                .reply(200, buildTicketResponse(12345));
        });

        it('should return a ticket type object.', async () => {
            const ticketType = await ticketService.loadTicket('', 12345, false, false)
            expect(ticketType).not.undefined;
            expect(ticketType.TicketID).equal(12345);
        });
    });

    describe('Create a valid request to retrieve a ticket with articles and history.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .query({
                    fields: 'Ticket.*',
                    include: 'TimeUnits,DynamicFields,Links,Articles,Attachments,Flags,History',
                    expand: 'Links,Articles,Attachments,Flags,History'
                })
                .reply(200, buildTicketResponse(12345));
        });

        it('should return a ticket type object.', async () => {
            const ticketType = await ticketService.loadTicket('', 12345, true, true)
            expect(ticketType).not.undefined;
            expect(ticketType.TicketID).equal(12345);
        });
    });

    describe("Ticket Articles", () => {

        describe("Get Articles", () => {

            describe("Create a valid request to retrieve articles.", () => {

                before(() => {
                    nockScope
                        .get(resourcePath + '/12345/articles')
                        .query({
                            expand: "Attachments",
                            include: "Attachments"
                        })
                        .reply(200, {
                            Article: [{ ArticleID: 0 }, { ArticleID: 0 }, { ArticleID: 0 }, { ArticleID: 0 }]
                        });
                });

                it('should return articles from ticket.', async () => {
                    const articles: Article[] = await ticketService.loadArticles('', 12345)
                    expect(articles).not.undefined;
                    expect(articles).an('array');
                    expect(articles).not.empty;
                });
            });
        });

        describe('Create a valid request to retrieve a specific attachment from article', () => {
            before(() => {
                nockScope
                    .get(resourcePath + '/12345/articles/1234/attachments/9876')
                    .query({ include: "Content" })
                    .reply(200, {
                        Attachment: { ID: 9876 }
                    });
            });

            it('should return a list with attachments', async () => {
                const response = await ticketService.loadArticleAttachment('', 12345, 1234, 9876);

                expect(response).not.undefined;
                expect(response.ID).equals(9876);
            });
        });

    });
});

function buildTicketResponse(id: number): TicketResponse {
    const response = new TicketResponse();
    response.Ticket = new Ticket(null);
    response.Ticket.TicketID = id;
    return response;
}

function buildCreateTicketResponse(id: number): CreateTicketResponse {
    const response = new CreateTicketResponse();
    response.TicketID = id;
    return response;
}