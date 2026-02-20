import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { APIUtil } from '../APIUtil';
import { PersonalSettingsService } from '../../../modules/user/server/PersonalSettingsService';
import { UserService } from '../../../modules/user/server/UserService';
import { User } from '../../../modules/user/model/User';
import { CacheService } from '../../services/cache/CacheService';
import { PersonalSettingsProperty } from '../../../modules/user/model/PersonalSettingsProperty';
import { routeConfiguration } from '../../routes/FastifyAuthentication';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    // @deprecated route - will be solved with object forms in future version
    fastify.get('/user/preferences', routeConfiguration(fastify), getPreferences);
    fastify.patch('/user/preferences', routeConfiguration(fastify), setPreferences);
    fastify.patch('/user/markObjectAsSeen', routeConfiguration(fastify), markObjectAsSeen);
}
async function getPreferences(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    let status = 200;
    let result = {};

    const preferences = await PersonalSettingsService.getInstance().getPersonalSettings().catch((e) => {
        status = 400;
        result = e;
        return null;
    });

    if (Array.isArray(preferences)) {
        result = { preferences };
    }

    return reply.status(status).send(result);
}

async function setPreferences(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token, profileRequestId } = APIUtil.getRequestData(req);

    let status = 200;
    let result = {};

    const { parameter } = req.body as any;

    const user = await UserService.getInstance().getUserByToken(token).catch((): User => null);
    if (user) {
        await UserService.getInstance().setPreferences(token, profileRequestId, parameter, user?.UserID, true)
            .catch((error) => {
                status = 400;
                result = error;
            });

        if (parameter?.some((p) => p[0] === PersonalSettingsProperty.USER_LANGUAGE)) {
            CacheService.getInstance().deleteKeys(PersonalSettingsProperty.USER_LANGUAGE);
        }
    }

    return reply.status(status).send(result);
}

async function markObjectAsSeen(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token, profileRequestId } = APIUtil.getRequestData(req);

    let status = 200;
    let result = {};

    const { objectType, objectIds } = req.body as any;
    await UserService.getInstance().markObjectAsSeen(token, '', objectType, objectIds).catch((e) => {
        status = 400;
        result = e;
    });

    return reply.status(status).send(result);
}

export default routes;