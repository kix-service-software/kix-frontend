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
import { NotesService, NotesSocketClient } from '../webapp/core';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('NotesService Tests', () => {

    const contextId = 'test-context';

    describe('Load notes via service', () => {

        let oldLoadNotes;

        before(() => {
            oldLoadNotes = NotesSocketClient.getInstance().loadNotes;
            NotesSocketClient.getInstance().loadNotes = async (): Promise<any> => {
                const notes = {};
                notes['wrongId'] = 'wrong notes';
                notes[contextId] = 'correct notes';
                notes['wrongId2'] = 'wrong notes2';
                return notes;
            };
        });

        after(() => {
            NotesSocketClient.getInstance().loadNotes = oldLoadNotes;
        });

        it('Should load notes for given context', async () => {
            const notes = await NotesService.getInstance().loadNotes(contextId);
            expect(notes).exist;
            expect(notes).equals('correct notes');
        });

        it('Should return undefined if no notes available', async () => {
            const notes = await NotesService.getInstance().loadNotes('failId');
            expect(notes).not.exist;
        });
    });

});

