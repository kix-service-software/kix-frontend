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
import { WebformService } from '../../../modules/webform/server/WebformService';
import { UserService } from '../../../modules/user/server/UserService';
import { routeConfiguration } from '../../routes/FastifyAuthentication';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/webforms', routeConfiguration(fastify), loadWebforms);
    fastify.post('/webforms', routeConfiguration(fastify), saveWebform);
    fastify.post('/webforms/:webformId', routeConfiguration(fastify), deleteWebform);
}

async function loadWebforms(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);

    let status = 200;
    let result = { webforms: [] };

    try {
        const webforms = await WebformService.getInstance().loadWebforms(token);
        result = { webforms };
    } catch (e) {
        status = 400;
        result = e;
    }

    return reply.status(status).send(result);
}

async function saveWebform(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    const { webform, webformId } = req.body as any;

    let status = 201;
    let result = {};

    try {
        const user = await UserService.getInstance().getUserByToken(token);
        const userId = user.UserID;

        const objectId = await WebformService.getInstance().saveWebform(
            token, userId, webform, webformId
        );

        result = { id: objectId };
    } catch (e) {
        status = 400;
        result = e;
    }

    return reply.status(status).send(result);
}

async function deleteWebform(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    const { webformId } = req.params as any;

    let status = 200;
    let result = {};

    try {
        await WebformService.getInstance().deleteWebform(token, webformId);
    } catch (e) {
        status = 400;
        result = e;
    }

    return reply.status(status).send(result);
}

export default routes;