/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    QueueResponse,
    QueuesResponse,
    CreateQueue,
    CreateQueueRequest,
    CreateQueueResponse,
    UpdateQueue,
    UpdateQueueRequest,
    UpdateQueueResponse
} from '@kix/core/dist/api';

import { Queue, SortOrder } from '@kix/core/dist/model';
import { IQueueService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/queues";

describe('Queue Service', () => {
    let nockScope;
    let queueService: IQueueService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        queueService = container.getDIContainer().get<IQueueService>("IQueueService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(queueService).not.undefined;
    });

    describe('Create a valid request to retrieve a queue.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildQueueResponse(12345));
        });

        it('should return a queue.', async () => {
            const queue: Queue = await queueService.getQueue('', 12345)
            expect(queue).not.undefined;
            expect(queue.QueueID).equal(12345);
        });
    });

    describe('Get multiple queues', () => {
        describe('Create a valid request to retrieve all queues.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildQueuesResponse(4));
            });

            it('should return a list of queues.', async () => {
                const queue: Queue[] = await queueService.getQueues('');
                expect(queue).not.undefined;
                expect(queue).an('array');
                expect(queue).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 queues', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildQueuesResponse(3));
            });

            it('should return a limited list of 3 queues.', async () => {
                const queues: Queue[] = await queueService.getQueues('', 3);
                expect(queues).not.undefined;
                expect(queues).an('array');
                expect(queues).not.empty;
                expect(queues.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of queues.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildQueuesResponse(2));
            });

            it('should return a sorted list of queues.', async () => {
                const queues: Queue[] = await queueService.getQueues('', null, SortOrder.DOWN);
                expect(queues).not.undefined;
                expect(queues).an('array');
                expect(queues).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of queues which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildQueuesResponse(3));
            });

            it('should return a list of queues filtered by changed after.', async () => {
                const queues: Queue[] = await queueService.getQueues('', null, null, "20170815");
                expect(queues).not.undefined;
                expect(queues).an('array');
                expect(queues).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of queues which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildQueuesResponse(6));
            });

            it('should return a limited list of queues filtered by changed after.', async () => {
                const queues: Queue[] = await queueService.getQueues('', 6, null, "20170815");
                expect(queues).not.undefined;
                expect(queues).an('array');
                expect(queues.length).equal(6);
                expect(queues).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of queues', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildQueuesResponse(6));
            });

            it('should return a limited, sorted list of queues.', async () => {
                const queues: Queue[] = await queueService.getQueues('', 6, SortOrder.UP);
                expect(queues).not.undefined;
                expect(queues).an('array');
                expect(queues.length).equal(6);
                expect(queues).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of queues which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildQueuesResponse(4));
            });

            it('should return a sorted list of queues filtered by changed after.', async () => {
                const queues: Queue[] = await queueService.getQueues('', null, SortOrder.UP, "20170815");
                expect(queues).not.undefined;
                expect(queues).an('array');
                expect(queues).not.empty;
            });
        });
    });

    describe('Create queue', () => {
        describe('Create a valid request to create a new queue.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateQueueRequest(new CreateQueue('queue')))
                    .reply(200, buildCreateQueueResponse(123456));
            });

            it('should return a the id of the new queue.', async () => {
                const userId = await queueService.createQueue('', new CreateQueue('queue'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateQueueRequest(new CreateQueue('queue')))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await queueService.createQueue('', new CreateQueue('queue'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update queue', () => {
        describe('Create a valid request to update an existing queue.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                        new UpdateQueueRequest(new UpdateQueue('queue')))
                    .reply(200, buildUpdateQueueResponse(123456));
            });

            it('should return the id of the queue.', async () => {
                const userId = await queueService.updateQueue('', 123456, new UpdateQueue('queue'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing queue.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                        new UpdateQueueRequest(new UpdateQueue('queue')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await queueService.updateQueue('', 123456, new UpdateQueue('queue'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete queue', () => {

        describe('Create a valid request to delete a queue', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await queueService.deleteQueue('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a queue.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await queueService.deleteQueue('', 123456)
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

function buildQueueResponse(id: number): QueueResponse {
    const response = new QueueResponse();
    response.Queue = new Queue();
    response.Queue.QueueID = id;
    return response;
}

function buildQueuesResponse(groupCount: number): QueuesResponse {
    const response = new QueuesResponse();
    for (let i = 0; i < groupCount; i++) {
        response.Queue.push(new Queue());
    }
    return response;
}

function buildCreateQueueResponse(id: number): CreateQueueResponse {
    const response = new CreateQueueResponse();
    response.QueueID = id;
    return response;
}

function buildUpdateQueueResponse(id: number): UpdateQueueResponse {
    const response = new UpdateQueueResponse();
    response.QueueID = id;
    return response;
}