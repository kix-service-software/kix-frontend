/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticationService } from '../../../../../server/services/AuthenticationService';
import { LoginRequest } from '../../../modules/base-components/webapp/core/LoginRequest';
import { APIUtil } from '../APIUtil';
import { PermissionService } from '../../services/PermissionService';
import { HttpService } from '../../services/HttpService';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.post('/session', login);
    fastify.delete('/session', logout);
    fastify.get('/session/validatetoken', validateToken);
    fastify.get('/session/permissioncheck', checkPermissions);
    fastify.get('/session/user', getCurrentUser);
}

async function login(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const loginData = req.body as LoginRequest;
    const clientRequestId = APIUtil.getClientRequestId(req);

    let status = 201;
    let result = {};

    const token = await AuthenticationService.getInstance().login(
        loginData.userName, loginData.password, loginData.userType, loginData.negotiateToken,
        loginData.mfaToken, clientRequestId, req.headers
    ).catch((error: Error) => {
        status = 401;
        result = error.message;
        return null;
    });

    if (!token) {
        status = 401;
    } else if (loginData.fakeLogin) {
        status = 201;
    } else {
        try {
            const { baseRoute, application } = APIUtil.getRequestData(req);
            AuthenticationService.setSessionCookie(req, application, token);
            const redirect = loginData.redirectUrl ? loginData.redirectUrl : '/';
            const redirectUrl = `${baseRoute}${redirect}`;
            status = 201;
            result = { redirectUrl };
        } catch (e) {
            status = 400;
            result = e;
        }
    }

    return reply.status(status).send(result);
}

async function logout(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token, application } = APIUtil.getRequestData(req);
    await AuthenticationService.getInstance().logout(token).catch(() => null);

    (req as any)[`${application}-session`]?.delete();
    return reply.status(204).send();
}

async function validateToken(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token, clientRequestId } = APIUtil.getRequestData(req);

    const valid = await AuthenticationService.getInstance().validateToken(
        token, clientRequestId
    ).catch((error) => false);

    const status = valid ? 200 : 403;
    return reply.status(status).send();
}

async function checkPermissions(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token, clientRequestId } = APIUtil.getRequestData(req);

    let allowed = false;
    if (token) {
        const permissions = JSON.parse((req.query as any).permissions);
        const object = (req.query as any).object ? JSON.parse((req.query as any).object) : undefined;
        allowed = await PermissionService.getInstance().checkPermissions(token, permissions, clientRequestId, object)
            .catch(() => false);
    }

    const status = allowed ? 200 : 403;
    return reply.status(status).send();
}

async function getCurrentUser(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);

    let result;
    let status = 400;
    if (token) {
        const user = await HttpService.getInstance().getUserByToken(token).catch((error) => null);
        if (user) {
            status = 200;
            result = { user };
        }
    } else {
        status = 403;
    }
    return reply.status(status).send(result);
}

export default routes;