/* tslint:disable */
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { UserService, ConfigurationService } from '../../src/core/services'
import { User, UserPreference, KIXObjectType, PreferencesLoadingOptions, SetPreferenceOptions, Error } from '../../src/core/model';
import { UserResponse, UsersResponse, UserPreferencesResponse, SetPreferenceResponse } from '../../src/core/api';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/users';
const subResourcePath = 'preferences';
const nock = require('nock');

describe('User Service', () => {
    let nockScope;
    let apiURL: string;

    before(async () => {
        require('../TestSetup');
        apiURL = ConfigurationService.getInstance().getServerConfiguration().BACKEND_API_URL;
    });
    beforeEach(() => {
        nockScope = nock(apiURL);
    });

    it('Service instance is registered in container.', () => {
        expect(UserService.getInstance()).exist;
    });

    describe('Get multiple users.', () => {
        describe('Create a valid request to retrieve all users.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query((query) => true)
                    .reply(200, buildUsersResponse(4));
            });

            it('Should return a list of users.', async () => {
                const users: User[] = await UserService.getInstance().getUsers('');
                expect(users).exist;
                expect(users).an('array');
                expect(users).not.empty;
            });

        });
    });

    describe('Get user Information based on token.', () => {

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

        it('Should return a user with the id 123456 for the given token.', async () => {
            const user: User = await UserService.getInstance().getUserByToken("abcdefg12345");
            expect(user.UserID).equal(123456);
        });

    });

    describe('Get user preferences.', () => {

        const userId = 123456;

        before(() => {
            const userPreferencesResponse = new UserPreferencesResponse();
            const preference = new UserPreference();
            preference.ID = 'UserLanguage';
            preference.UserID = userId;
            preference.Value = 'en';
            userPreferencesResponse.UserPreference = [preference];

            nockScope
                .get(resourcePath + '/' + userId + '/' + subResourcePath)
                .reply(200, userPreferencesResponse);
        });

        it('Should return a preference list with one preference.', async () => {
            const userPreferences: UserPreference[] = await UserService.getInstance().loadObjects<UserPreference>(
                'someToken', KIXObjectType.USER_PREFERENCE, null, null, new PreferencesLoadingOptions(userId)
            );
            expect(userPreferences).exist;
            expect(userPreferences).an('array');
            expect(userPreferences.length).equal(1);
            expect(userPreferences[0].UserID).equal(123456);
            expect(userPreferences[0].ID).equal('UserLanguage');
            expect(userPreferences[0].Value).equal('en');
        });

    });

    describe('Set user preferences.', () => {

        const userId = 123456;
        const preferenceId = 'UserLanguage';
        const anotherPreferenceId = 'UserLanguage2';

        describe('Create language preference.', () => {
            before(() => {
                const setUserPreferencesResponse = new SetPreferenceResponse();
                setUserPreferencesResponse.UserPreferenceID = preferenceId;
                nockScope
                    .post(resourcePath + '/' + userId + '/' + subResourcePath)
                    .reply(201, setUserPreferencesResponse);
            });

            it('Should created a new language preference.', async () => {
                const newLanguagePreferenceId: string | number = await UserService.getInstance().createObject(
                    'someToken', KIXObjectType.USER_PREFERENCE,
                    [
                        ['ID', preferenceId],
                        ['Value', 'en']
                    ],
                    new SetPreferenceOptions(userId)
                );
                expect(newLanguagePreferenceId).exist;
                expect(newLanguagePreferenceId).an('string');
                expect(newLanguagePreferenceId).equal(preferenceId);
            });
        });

        describe('Create language preference with error.', () => {
            before(() => {
                const setUserPreferencesResponse = new SetPreferenceResponse();
                setUserPreferencesResponse.UserPreferenceID = preferenceId;
                nockScope
                    .post(resourcePath + '/' + userId + '/' + subResourcePath)
                    .reply(409, new Error('Object.ObjectAlreadyExists', 'The request could not be finished due to a conflict.'));
            });

            it('Should not created a new language preference because of an error.', async () => {
                let error: Error = null;
                await UserService.getInstance().createObject(
                    'someToken', KIXObjectType.USER_PREFERENCE,
                    [
                        ['ID', preferenceId],
                        ['Value', 'en']
                    ],
                    new SetPreferenceOptions(userId)
                ).catch((errorResult: Error) => {
                    error = errorResult;
                });
                expect(error).exist;
                expect(error.Code).equal('Object.ObjectAlreadyExists');
            });
        });

        describe('Update language preference.', () => {
            before(() => {
                const setUserPreferencesResponse = new SetPreferenceResponse();
                setUserPreferencesResponse.UserPreferenceID = preferenceId;
                nockScope
                    .patch(resourcePath + '/' + userId + '/' + subResourcePath + '/' + preferenceId)
                    .reply(200, setUserPreferencesResponse);
            });

            it('Should update the language preference.', async () => {
                const updatedLanguagePreferenceId: string | number = await UserService.getInstance().updateObject(
                    'someToken', KIXObjectType.USER_PREFERENCE,
                    [
                        ['Value', 'de']
                    ],
                    preferenceId, new SetPreferenceOptions(userId)
                );
                expect(updatedLanguagePreferenceId).exist;
                expect(updatedLanguagePreferenceId).an('string');
                expect(updatedLanguagePreferenceId).equal(preferenceId);
            });
        });

        describe('Update language preference with error.', () => {
            before(() => {
                const setUserPreferencesResponse = new SetPreferenceResponse();
                setUserPreferencesResponse.UserPreferenceID = preferenceId;
                nockScope
                    .patch(resourcePath + '/' + userId + '/' + subResourcePath + '/' + preferenceId)
                    .reply(404, new Error('Object.ObjectDoesNotExists', 'The request could not be finished due to a conflict.'));
            });

            it('Should not update the language preference because of an error.', async () => {
                let error: Error = null;
                await UserService.getInstance().updateObject(
                    'someToken', KIXObjectType.USER_PREFERENCE,
                    [
                        ['Value', 'de']
                    ],
                    preferenceId, new SetPreferenceOptions(userId)
                ).catch((errorResult: Error) => {
                    error = errorResult;
                });
                expect(error).exist;
                expect(error.Code).equal('Object.ObjectDoesNotExists');
            });
        });

        describe('Set two preferences (one create, one update) without error.', () => {
            before(() => {
                const userPreferencesResponse = new UserPreferencesResponse();
                const preference = new UserPreference();
                preference.ID = anotherPreferenceId;
                preference.UserID = userId;
                preference.Value = 'en';
                userPreferencesResponse.UserPreference = [preference];
                nockScope
                    .get(resourcePath + '/' + userId + '/' + subResourcePath)
                    .reply(200, userPreferencesResponse);

                const newUserPreferencesResponse = new SetPreferenceResponse();
                newUserPreferencesResponse.UserPreferenceID = preferenceId;
                nockScope
                    .post(resourcePath + '/' + userId + '/' + subResourcePath)
                    .reply(201, newUserPreferencesResponse);
                const updateUserPreferencesResponse = new SetPreferenceResponse();
                updateUserPreferencesResponse.UserPreferenceID = anotherPreferenceId;
                nockScope
                    .patch(resourcePath + '/' + userId + '/' + subResourcePath + '/' + anotherPreferenceId)
                    .reply(200, updateUserPreferencesResponse);
            });

            it('Should get no error.', async () => {
                let error: boolean = false;
                await UserService.getInstance().setPreferences(
                    'someToken', [
                        [preferenceId, 'de'],
                        [anotherPreferenceId, 'en']
                    ],
                    userId
                ).catch(() => {
                    error = true;
                });
                expect(error).to.be.false;
            });
        });
        describe('Set two preferences (one create, one update) with error for create.', () => {
            before(() => {
                const userPreferencesResponse = new UserPreferencesResponse();
                const preference = new UserPreference();
                preference.ID = anotherPreferenceId;
                preference.UserID = userId;
                preference.Value = 'en';
                userPreferencesResponse.UserPreference = [preference];
                nockScope
                    .get(resourcePath + '/' + userId + '/' + subResourcePath)
                    .reply(200, userPreferencesResponse);

                const newUserPreferencesResponse = new SetPreferenceResponse();
                newUserPreferencesResponse.UserPreferenceID = preferenceId;
                nockScope
                    .post(resourcePath + '/' + userId + '/' + subResourcePath)
                    .reply(400, new Error('CREATE', 'Create-Error'));
                const updateUserPreferencesResponse = new SetPreferenceResponse();
                updateUserPreferencesResponse.UserPreferenceID = anotherPreferenceId;
                nockScope
                    .patch(resourcePath + '/' + userId + '/' + subResourcePath + '/' + anotherPreferenceId)
                    .reply(200, updateUserPreferencesResponse);
            });

            it('Should get a "CREATE" error.', async () => {
                let error: Error = null;
                await UserService.getInstance().setPreferences(
                    'someToken', [
                        [preferenceId, 'de'],
                        [anotherPreferenceId, 'en']
                    ],
                    userId
                ).catch((errorResult: Error) => {
                    error = errorResult;
                });
                expect(error).exist;
                expect(error.Code).equal('CREATE');
            });
        });

        describe('Set two preferences (one create, one update) with error for update.', () => {
            before(() => {
                const userPreferencesResponse = new UserPreferencesResponse();
                const preference = new UserPreference();
                preference.ID = anotherPreferenceId;
                preference.UserID = userId;
                preference.Value = 'en';
                userPreferencesResponse.UserPreference = [preference];
                nockScope
                    .get(resourcePath + '/' + userId + '/' + subResourcePath)
                    .reply(200, userPreferencesResponse);

                const newUserPreferencesResponse = new SetPreferenceResponse();
                newUserPreferencesResponse.UserPreferenceID = preferenceId;
                nockScope
                    .post(resourcePath + '/' + userId + '/' + subResourcePath)
                    .reply(201, newUserPreferencesResponse);
                const updateUserPreferencesResponse = new SetPreferenceResponse();
                updateUserPreferencesResponse.UserPreferenceID = anotherPreferenceId;
                nockScope
                    .patch(resourcePath + '/' + userId + '/' + subResourcePath + '/' + anotherPreferenceId)
                    .reply(400, new Error('UPDATE', 'Update-Error'));
            });

            it('Should get a "UPDATE" error.', async () => {
                let error: Error = null;
                await UserService.getInstance().setPreferences(
                    'someToken', [
                        [preferenceId, 'de'],
                        [anotherPreferenceId, 'en']
                    ],
                    userId
                ).catch((errorResult: Error) => {
                    error = errorResult;
                });
                expect(error).exist;
                expect(error.Code).equal('UPDATE');
            });
        });

        describe('Set two preferences (one create, one update) with error for both.', () => {
            before(() => {
                const userPreferencesResponse = new UserPreferencesResponse();
                const preference = new UserPreference();
                preference.ID = anotherPreferenceId;
                preference.UserID = userId;
                preference.Value = 'en';
                userPreferencesResponse.UserPreference = [preference];
                nockScope
                    .get(resourcePath + '/' + userId + '/' + subResourcePath)
                    .reply(200, userPreferencesResponse);

                const newUserPreferencesResponse = new SetPreferenceResponse();
                newUserPreferencesResponse.UserPreferenceID = preferenceId;
                nockScope
                    .post(resourcePath + '/' + userId + '/' + subResourcePath)
                    .reply(400, new Error('CREATE', 'Create-Error'));
                const updateUserPreferencesResponse = new SetPreferenceResponse();
                updateUserPreferencesResponse.UserPreferenceID = anotherPreferenceId;
                nockScope
                    .patch(resourcePath + '/' + userId + '/' + subResourcePath + '/' + anotherPreferenceId)
                    .reply(400, new Error('UPDATE', 'Update-Error'));
            });

            it('Should get a combined error.', async () => {
                let error: Error = null;
                await UserService.getInstance().setPreferences(
                    'someToken', [
                        [preferenceId, 'de'],
                        [anotherPreferenceId, 'en']
                    ],
                    userId
                ).catch((errorResult: Error) => {
                    error = errorResult;
                });
                expect(error).exist;
                expect(error.Code).equal('CREATE');
                expect(error.Message).equal('Create-Error\nUpdate-Error');
            });
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
