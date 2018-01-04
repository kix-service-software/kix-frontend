/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    GroupResponse,
    GroupsResponse,
    CreateGroup,
    CreateGroupRequest,
    CreateGroupResponse,
    UpdateGroupRequest,
    UpdateGroupResponse
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { Group } from '@kix/core/dist/model';
import { IGroupService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/groups";

describe('Group Service', () => {
    let nockScope;
    let groupService: IGroupService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        groupService = container.getDIContainer().get<IGroupService>("IGroupService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(groupService).not.undefined;
    });

    describe('Create a valid request to retrieve a group.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildGroupResponse(12345));
        });

        it('should return a group.', async () => {
            const group: Group = await groupService.getGroup('', 12345)
            expect(group).not.undefined;
            expect(group.ID).equal(12345);
        });
    });

    describe('Get multiple groups', () => {
        describe('Create a valid request to retrieve all groups.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildGroupsResponse(4));
            });

            it('should return a list of groups.', async () => {
                const group: Group[] = await groupService.getGroups('');
                expect(group).not.undefined;
                expect(group).an('array');
                expect(group).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 groups', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildGroupsResponse(3));
            });

            it('should return a limited list of 3 groups.', async () => {
                const groups: Group[] = await groupService.getGroups('', 3);
                expect(groups).not.undefined;
                expect(groups).an('array');
                expect(groups).not.empty;
                expect(groups.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of groups.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildGroupsResponse(2));
            });

            it('should return a sorted list of groups.', async () => {
                const groups: Group[] = await groupService.getGroups('', null, SortOrder.DOWN);
                expect(groups).not.undefined;
                expect(groups).an('array');
                expect(groups).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of groups witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildGroupsResponse(3));
            });

            it('should return a list of groups filtered by changed after.', async () => {
                const groups: Group[] = await groupService.getGroups('', null, null, "20170815");
                expect(groups).not.undefined;
                expect(groups).an('array');
                expect(groups).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of groups witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildGroupsResponse(6));
            });

            it('should return a limited list of groups filtered by changed after.', async () => {
                const groups: Group[] = await groupService.getGroups('', 6, null, "20170815");
                expect(groups).not.undefined;
                expect(groups).an('array');
                expect(groups.length).equal(6);
                expect(groups).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of groups', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildGroupsResponse(6));
            });

            it('should return a limited, sorted list of groups.', async () => {
                const groups: Group[] = await groupService.getGroups('', 6, SortOrder.UP);
                expect(groups).not.undefined;
                expect(groups).an('array');
                expect(groups.length).equal(6);
                expect(groups).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of groups witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildGroupsResponse(4));
            });

            it('should return a sorted list of groups filtered by changed after.', async () => {
                const groups: Group[] = await groupService.getGroups('', null, SortOrder.UP, "20170815");
                expect(groups).not.undefined;
                expect(groups).an('array');
                expect(groups).not.empty;
            });
        });
    });

    describe('Create group', () => {
        describe('Create a valid request to create a new group.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateGroupRequest(new CreateGroup('group', 'comment', 1)))
                    .reply(200, buildCreateGroupResponse(123456));
            });

            it('should return a the id of the new group.', async () => {
                const userId = await groupService.createGroup('', 'group', 'comment', 1);
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateGroupRequest(new CreateGroup('group', 'comment', 1)))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await groupService.createGroup('', 'group', 'comment', 1)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update group', () => {
        describe('Create a valid request to update an existing group.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateGroupRequest('group', 'comment', 1))
                    .reply(200, buildUpdateGroupResponse(123456));
            });

            it('should return the id of the group.', async () => {
                const userId = await groupService.updateGroup('', 123456, 'group', 'comment', 1);
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing group.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateGroupRequest('group', 'comment', 1))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await groupService.updateGroup('', 123456, 'group', 'comment', 1)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete group', () => {

        describe('Create a valid request to delete a group', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await groupService.deleteGroup('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a group.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await groupService.deleteGroup('', 123456)
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

function buildGroupResponse(id: number): GroupResponse {
    const response = new GroupResponse();
    response.Group = new Group();
    response.Group.ID = id;
    return response;
}

function buildGroupsResponse(groupCount: number): GroupsResponse {
    const response = new GroupsResponse();
    for (let i = 0; i < groupCount; i++) {
        response.Group.push(new Group());
    }
    return response;
}

function buildCreateGroupResponse(id: number): CreateGroupResponse {
    const response = new CreateGroupResponse();
    response.GroupID = id;
    return response;
}

function buildUpdateGroupResponse(id: number): UpdateGroupResponse {
    const response = new UpdateGroupResponse();
    response.GroupID = id;
    return response;
}