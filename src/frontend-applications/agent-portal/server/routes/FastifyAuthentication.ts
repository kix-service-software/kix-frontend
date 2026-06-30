/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { AuthenticationService } from '../../../../server/services/AuthenticationService';
import { APIUtil } from '../api/APIUtil';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';

function routeConfiguration(fastify: FastifyInstance, opts: RouteShorthandOptions = {}): any {
    const authMethod = (fastify as any).authenticate;
    opts.onRequest = [authMethod];
    return opts;
}

// eslint-disable-next-line max-lines-per-function
function registerAuthenticationModule(fastify: FastifyInstance): void {
    fastify.register(require('@fastify/auth'));

    fastify.decorate('verifyToken', async (req: FastifyRequest, reply: FastifyReply) => {
        const { clientRequestId } = APIUtil.getRequestData(req);

        const token = APIUtil.getToken(req, 'agent-portal');

        const valid = await AuthenticationService.getInstance().validateToken(
            token, clientRequestId
        ).catch((error) => false);

        if (!valid) {
            let query = '';
            if (!req.url?.startsWith('auth')) {
                const url = encodeURIComponent(req.url);
                query = `?redirectUrl=${url}`;
            }

            const baseRoute = ConfigurationService.getEnvString('BASE_ROUTE') || '';
            return reply.redirect(`${baseRoute}/auth${query}`);
        }
    });

    fastify.decorate(
        'authenticate',
        async (req: FastifyRequest, reply: FastifyReply) => {
            const { token } = APIUtil.getRequestData(req);
            if (!token) {
                reply.status(401).send();
            }
        }
    );

    const sessionName = 'agent-portal-session';
    fastify.register(require('@fastify/secure-session'), {
        sessionName,
        secret: AuthenticationService.getInstance().tokenSecret,
        salt: AuthenticationService.getInstance().tokenSalt,
        cookie: {
            path: '/',
            httpOnly: true
        }
    });
}

export { routeConfiguration, registerAuthenticationModule };
