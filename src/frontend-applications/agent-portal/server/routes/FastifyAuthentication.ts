import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationService } from '../../../../server/services/AuthenticationService';
import { APIUtil } from '../api/APIUtil';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';

function routeConfiguration(fastify: FastifyInstance): any {
    const authMethod = (fastify as any).authenticate;
    return { onRequest: [authMethod] };
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
