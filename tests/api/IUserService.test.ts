/* tslint:disable */
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { UserService, ConfigurationService } from '../../src/core/services'
import { User } from '../../src/core/model';
import { UserResponse, UsersResponse } from '../../src/core/api';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('User Service', () => {
    let nockScope;
    let apiURL: string;

    before(async () => {
        require('../TestSetup');
        const nock = require('nock');
        apiURL = ConfigurationService.getInstance().getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(UserService.getInstance()).exist;
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
                const users: User[] = await UserService.getInstance().getUsers('');
                expect(users).exist;
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
            user.Preferences = [];
            userResponse.User = user;

            nockScope
                .matchHeader('Authorization', "Token abcdefg12345")
                .get('/user')
                .query({ include: "Tickets,Preferences" })
                .reply(200, userResponse);
        });

        it('Should return a user with the id 123456 for the given token', async () => {
            const user: User = await UserService.getInstance().getUserByToken("abcdefg12345");
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
