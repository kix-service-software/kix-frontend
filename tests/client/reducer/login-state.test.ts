// tslint:disable
import { LoginState } from './../../../src/model-client/authentication/';
import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

import {
    LOGIN_USERNAME_CHANGED,
    LOGIN_PASSWORD_CHANGED,
    LOGIN_ERROR,
    LOGIN_VALIDATE
} from '../../../src/model-client/store/actions';

describe('Client - Reducer - Login', () => {
    let store;

    before(() => {
        store = require('../../../src/model-client/store');
    });

    describe('Dispatch LOGIN_USERNAME_CHANGED Action', () => {
        it('Should set the username on the state', async () => {
            await store.dispatch(LOGIN_USERNAME_CHANGED('newUserName'));

            const state: LoginState = store.getState().login;
            expect(state.userName).equal('newUserName');
        });
    });

    describe('Dispatch LOGIN_PASSWORD_CHANGED Action', () => {
        it('Should set the password on the state', async () => {
            await store.dispatch(LOGIN_PASSWORD_CHANGED('newPassword'));

            const state: LoginState = store.getState().login;
            expect(state.password).equal('newPassword');
        });
    });

    describe('Dispatch LOGIN_VALIDATE Actions', () => {
        describe('Dispatch LOGIN_USERNAME_CHANGED Action with invalid username', () => {
            it('Should set valid to false on the state', async () => {
                await store.dispatch(LOGIN_USERNAME_CHANGED(''));

                const state: LoginState = store.getState().login;
                await store.dispatch(LOGIN_VALIDATE(state.userName, state.password));

                expect(state.userName).equal('');
                expect(state.valid).false;
            });
        });

        describe('Dispatch LOGIN_PASSWORD_CHANGED Action with invalid password', () => {
            it('Should set valid to false on the state', async () => {
                await store.dispatch(LOGIN_PASSWORD_CHANGED(''));

                let state: LoginState = store.getState().login;
                await store.dispatch(LOGIN_VALIDATE(state.userName, state.password));

                state = store.getState().login;
                expect(state.password).equal('');
                expect(state.valid).false;
            });
        });

        describe('Dispatch LOGIN_USERNAME_CHANGED, LOGIN_PASSWORD_CHANGED Action with valid values', () => {
            it('Should set valid to true on the state', async () => {
                await store.dispatch(LOGIN_PASSWORD_CHANGED('validPW'));
                await store.dispatch(LOGIN_USERNAME_CHANGED('validUser'));

                let state: LoginState = store.getState().login;
                expect(state.password).equal('validPW');
                expect(state.userName).equal('validUser');

                await store.dispatch(LOGIN_VALIDATE(state.userName, state.password));

                state = store.getState().login;
                expect(state.valid).true;
            });
        });
    });

    describe('Dispatch LOGIN_ERROR Action', () => {
        it('Should set the error on the state', async () => {
            await store.dispatch(LOGIN_ERROR('newError'));

            const state: LoginState = store.getState().login;
            expect(state.error).equal('newError');
        });
    });

});
