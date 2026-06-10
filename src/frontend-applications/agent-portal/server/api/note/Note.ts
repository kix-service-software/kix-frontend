/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { APIUtil } from '../APIUtil';
import { UserService } from '../../../modules/user/server/UserService';
import { User } from '../../../modules/user/model/User';
import { routeConfiguration } from '../../routes/FastifyAuthentication';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/notes', routeConfiguration(fastify), loadNotes);
    fastify.post('/notes', routeConfiguration(fastify), saveNotes);
}

async function loadNotes(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    const user = await UserService.getInstance().getUserByToken(token).catch((): User => null);

    let notes = {};
    if (user) {
        const notesPreference = user.Preferences.find((p) => p.ID?.endsWith('notes'));
        if (notesPreference) {
            notes = JSON.parse(notesPreference.Value);
        }
    }

    return reply.status(200).send({ notes });
}

async function saveNotes(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    if (token) {
        const { contextId, notes } = req.body as any;

        const user = await UserService.getInstance().getUserByToken(token)
            .catch((): User => null);

        let status = 201;
        let result = {};

        if (user) {
            const notesPreference = user.Preferences.find((p) => p.ID?.endsWith('notes'));
            let notesConfig = {};
            if (notesPreference) {
                notesConfig = JSON.parse(notesPreference.Value);
            }

            notesConfig[contextId] = notes;
            const value = JSON.stringify(notesConfig);

            await UserService.getInstance().setPreferences(token, 'Notes', [['notes', value]])
                .catch((error: Error) => {
                    status = 400;
                    result = error;
                });

        } else {
            status = 400;
            result = 'No user available.';
        }

        return reply.status(status).send(result);
    }
}

export default routes;