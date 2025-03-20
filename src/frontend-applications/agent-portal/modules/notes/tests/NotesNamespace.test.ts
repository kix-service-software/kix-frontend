/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { NotesNamespace } from '../server/NotesNamespace';
import { UserService } from '../../user/server/UserService';
import { User } from '../../user/model/User';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { UserPreference } from '../../user/model/UserPreference';
import { LoadNotesResponse } from '../model/LoadNotesResponse';
import { SocketResponse } from '../../base-components/webapp/core/SocketResponse';
import { NotesEvent } from '../model/NotesEvent';
import { SocketEvent } from '../../base-components/webapp/core/SocketEvent';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('NotesNamespace Tests', () => {

    before(() => {
        require('../../../../../../tests/TestSetup');
    });

    describe('Check for correct namespace name', () => {
        it('The name should be notes', () => {
            const name = (NotesNamespace.getInstance() as any).getNamespace();
            expect(name).exist;
            expect(name).equals('notes');
        });
    });

    describe('Load notes via namespace', () => {

        let oldLoadNotes;
        let oldGetUser;

        before(() => {
            oldGetUser = UserService.getInstance().getUserByToken;
            oldLoadNotes = (NotesNamespace.getInstance() as any).loadNotes;

            UserService.getInstance().getUserByToken = async (token: string): Promise<User> => {
                const user = new User();
                const clientId = ConfigurationService.getInstance().getServerConfiguration().NOTIFICATION_CLIENT_ID;

                const notes = {
                    testnotes: 'test notes',
                    others: 'other notes'
                }

                const notesPreference = new UserPreference();
                notesPreference.ID = clientId + '_notes';
                notesPreference.Value = JSON.stringify(notes);

                user.Preferences = [notesPreference];
                return user;
            };
        });

        after(() => {
            UserService.getInstance().getUserByToken = oldGetUser;
            (NotesNamespace.getInstance() as any).loadNotes = oldLoadNotes;
        });

        it('Should load notes from user preferences', async () => {
            const response: SocketResponse<LoadNotesResponse> = await (NotesNamespace.getInstance() as any).loadNotes(
                {
                    token: 'token',
                    requestId: 'request',
                    clientRequestId: 'client'
                },
                {
                    handshake: {
                        headers: {
                            cookie: "token=token"
                        }
                    }
                }
            );

            expect(response).exist;
            expect(response.data).exist;
            expect(response.data['notes']).exist;
            expect(response.data['notes']['testnotes']).exist;
            expect(response.data['notes']['others']).exist;
            expect(response.event).equals(NotesEvent.NOTES_LOADED);
        });

    });

    describe('Save notes if user preference exists', () => {

        let oldSetPreferences;
        let oldGetUser;

        before(() => {
            oldGetUser = UserService.getInstance().getUserByToken;
            oldSetPreferences = UserService.getInstance().setPreferences;

            UserService.getInstance().getUserByToken = async (token: string): Promise<User> => {
                let user;
                if (token !== 'wrong') {
                    user = new User();
                    const clientId = ConfigurationService.getInstance().getServerConfiguration().NOTIFICATION_CLIENT_ID;

                    const notes = {
                        testnotes: 'test notes',
                        others: 'other notes'
                    }

                    const notesPreference = new UserPreference();
                    notesPreference.ID = clientId + '_notes';
                    notesPreference.Value = JSON.stringify(notes);

                    user.Preferences = [notesPreference];
                }
                return user;
            };

            UserService.getInstance().setPreferences = async (): Promise<void> => { };
        });

        after(() => {
            UserService.getInstance().getUserByToken = oldGetUser;
            UserService.getInstance().setPreferences = oldSetPreferences;
        });

        it('Should load notes from user preferences', async () => {
            const response: SocketResponse = await (NotesNamespace.getInstance() as any).saveNotes(
                {
                    token: 'token',
                    requestId: 'request',
                    clientRequestId: 'client',
                    contextId: 'test-context',
                    notes: 'test notes'
                },
                {
                    handshake: {
                        headers: {
                            cookie: "token=token"
                        }
                    }
                });

            expect(response).exist;
            expect(response.event).equals(NotesEvent.SAVE_NOTES_FINISHED);
        });

        it('Should return error response if user not exists', async () => {
            const response: SocketResponse = await (NotesNamespace.getInstance() as any).saveNotes(
                {
                    token: 'wrong',
                    requestId: 'request',
                    clientRequestId: 'client',
                    contextId: 'test-context',
                    notes: 'test notes'
                },
                {
                    handshake: {
                        headers: {
                            cookie: "token=wrong"
                        }
                    }
                }
            );

            expect(response).exist;
            expect(response.event).equals(SocketEvent.ERROR);
        });

    });

});

