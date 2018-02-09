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
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { Article, Ticket } from '@kix/core/dist/model';
import { IConfigurationService, ITicketService } from '@kix/core/dist/services';

import { container } from '../../../src/Container';

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
            const ticketType = await ticketService.getTicket('', 12345)
            expect(ticketType).not.undefined;
            expect(ticketType.TicketID).equal(12345);
        });
    });

    describe('Create Ticket', () => {
        describe('Create a valid request to create a new ticket.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateTicketRequest(new CreateTicket('', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [], [])))
                    .reply(200, buildCreateTicketResponse(123456));
            });

            it('should return a the id of the new users.', async () => {
                const userId = await ticketService.createTicket('', new CreateTicket('', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [], []));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateTicketRequest(new CreateTicket('', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [], [])))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await ticketService.createTicket('', new CreateTicket('', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [], []))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update Ticket', () => {
        describe('Create a valid request to update an existing ticket.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateTicketRequest(
                        new UpdateTicket('', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, []))
                    )
                    .reply(200, buildUpdateTicketResponse(123456));
            });

            it('should return the id of the ticket type.', async () => {
                const ticketId = await ticketService.updateTicket('', 123456,
                    new UpdateTicket('', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [])
                );
                expect(ticketId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing ticket type.', () => {
            before(() => {
                nockScope.patch(resourcePath + '/123456',
                    new UpdateTicketRequest(
                        new UpdateTicket('', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [])
                    )
                ).reply(400, {});
            });

            it('should throw a error.', async () => {
                const ticketId = await ticketService.updateTicket('', 123456,
                    new UpdateTicket('', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [])
                ).then((result) => {
                    expect(true).false;
                }).catch((error: HttpError) => {
                    expect(error).instanceof(HttpError);
                    expect(error.status).equals(400);
                });
            });

        });
    });

    describe('Delete Ticket', () => {

        describe('Create a valid request to delete a ticket', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await ticketService.deleteTicket('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a ticket.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                await ticketService.deleteTicket('', 123456)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

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
                    const articles: Article[] = await ticketService.getArticles('', 12345)
                    expect(articles).not.undefined;
                    expect(articles).an('array');
                    expect(articles).not.empty;
                });
            });

            describe("Create a valid request to retrieve a specific article.", () => {
                before(() => {
                    nockScope
                        .get(resourcePath + '/12345/articles/54321')
                        .reply(200, {
                            Article: { ArticleID: 54321 }
                        });
                });

                it('should return articles from ticket.', async () => {
                    const article = await ticketService.getArticle('', 12345, 54321)
                    expect(article).not.undefined;
                    expect(article.ArticleID).equals(54321);
                });
            });
        });

        describe("Create a valid request to create a new article.", () => {
            before(() => {
                nockScope
                    .post(resourcePath + '/12345/articles', new CreateArticleRequest(
                        new CreateArticle(
                            '', '', '', '', '', 0, 0, '', '', '', '', '', true, [], [], [], [], []
                        ))
                    )
                    .reply(200, {
                        ArticleID: 1234
                    });
            });

            it('should return the id of the new article.', async () => {
                const response = await ticketService.createArticle('', 12345,
                    new CreateArticle(
                        '', '', '', '', '', 0, 0, '', '', '', '', '', true, [], [], [], [], []
                    ));

                expect(response).not.undefined;
                expect(response).equal(1234);
            });
        });

        describe('Create a valid request to retrieve attachments from article', () => {
            before(() => {
                nockScope
                    .get(resourcePath + '/12345/articles/1234/attachments')
                    .reply(200, { Attachment: [] });
            });

            it('should return a list with attachments', async () => {
                const response = await ticketService.getArticleAttachments('', 12345, 1234);

                expect(response).not.undefined;
                expect(response).an('array');
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
                const response = await ticketService.getArticleAttachment('', 12345, 1234, 9876);

                expect(response).not.undefined;
                expect(response.ID).equals(9876);
            });
        });

        describe('Create a attachment on article', () => {
            before(() => {
                nockScope.post(
                    resourcePath + '/12345/articles/1234/attachments',
                    new CreateArticleAttachmentRequest(new CreateAttachment('', '', ''))
                ).reply(200, {
                    AttachmentID: 9876
                });
            });

            it('should return the id of the new attachment', async () => {
                const response = await ticketService.createArticleAttachment('', 12345, 1234, '', '', '');

                expect(response).not.undefined;
                expect(response).equals(9876);
            });
        });

    });

    describe("Ticket History", () => {

        describe("Create a valid request to retrieve the ticket history", () => {

            before(() => {
                nockScope.get(
                    resourcePath + '/12345/history'
                ).reply(200, {
                    History: [{ HistoryID: 0 }]
                });
            });

            it("should return a list of history entries for the ticket.", async () => {
                const response = await ticketService.getTicketHistory('', 12345);

                expect(response).not.undefined;
                expect(response).an('array');
            });

        });

        describe("Create a valid request to retrieve a history entry from the ticket history", () => {

            before(() => {
                nockScope.get(
                    resourcePath + '/12345/history/8765'
                ).reply(200, {
                    History: { HistoryID: 0 }
                });
            });

            it("should return a list of history entries for the ticket.", async () => {
                const response = await ticketService.getTicketHistoryEntry('', 12345, 8765);

                expect(response).not.undefined;
                expect(response.HistoryID).equals(0);
            });

        });
    });
});

function buildTicketResponse(id: number): TicketResponse {
    const response = new TicketResponse();
    response.Ticket = new Ticket();
    response.Ticket.TicketID = id;
    return response;
}

function buildCreateTicketResponse(id: number): CreateTicketResponse {
    const response = new CreateTicketResponse();
    response.TicketID = id;
    return response;
}

function buildUpdateTicketResponse(id: number): UpdateTicketResponse {
    const response = new UpdateTicketResponse();
    response.TicketID = id;
    return response;
}