/* tslint:disable no-var-requires no-unused-expression max-line-length */
import { UserResponse, UsersResponse } from '@kix/core/dist/api';
import { User } from '@kix/core/dist/model';
import { IConfigurationService, IUserService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { container } from '../../../src/Container';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('User Service', () => {
    let nockScope;
    let userService: IUserService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        userService = container.getDIContainer().get<IUserService>("IUserService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(userService).not.undefined;
    });

    describe('Get multiple users', () => {
        describe('Create a valid request to retrieve all users.', () => {

            before(() => {
                nockScope
                    .get('/users')
                    .query((query) => true)
                    .reply(200, buildUsersResponse(4));
            });

            it('should return a list of users.', async () => {
                const users: User[] = await userService.getUsers('');
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });

        });
    });

    describe('Get user Information based on token', () => {

        before(() => {
            const userResponse = new UserResponse();
            const user = new User();
            user.UserID = 123456;
            userResponse.User = user;

            nockScope
                .matchHeader('Authorization', "Token abcdefg12345")
                .get('/user')
                .reply(200, userResponse);
        });

        it('Should return a user with the id 123456 for the given token', async () => {
            const user: User = await userService.getUserByToken("abcdefg12345");
            expect(user.UserID).equal(123456);
        });

    });

});

function buildUsersResponse(userCount: number): UsersResponse {
    const response = new UsersResponse();
    for (let i = 0; i < userCount; i++) {
        response.User.push(new User());
    }
    return response;
}
