import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { APIUtil } from '../APIUtil';
import { CacheService } from '../../services/cache';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { SysConfigOptionProperty } from '../../../modules/sysconfig/model/SysConfigOptionProperty';
import { SearchOperator } from '../../../modules/search/model/SearchOperator';
import { FilterType } from '../../../model/FilterType';
import { FilterDataType } from '../../../model/FilterDataType';
import { SysConfigOption } from '../../../modules/sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { SysConfigService } from '../../../modules/sysconfig/server/SysConfigService';
import { ContextPreference } from '../../../model/ContextPreference';
import { UserService } from '../../../modules/user/server/UserService';
import { User } from '../../../modules/user/model/User';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { ConfigurationCache } from './ConfigurationCache';
import { APIHeader } from '../APIHeader';

import { routeConfiguration } from '../../routes/FastifyAuthentication';
import { PromiseQueue } from './PromiseQueue';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get(
        '/context/:contextId/configuration', routeConfiguration(fastify),
        loadContextConfiguration
    );
    fastify.get(
        '/context/configurations', routeConfiguration(fastify),
        loadContextConfigurations
    );
    fastify.post(
        '/context/configurations', routeConfiguration(fastify),
        rebuildConfiguration
    );
    fastify.get(
        '/context/store', routeConfiguration(fastify),
        loadStoredContexts
    );
    fastify.post(
        '/context/store', routeConfiguration(fastify),
        storeContext
    );
    fastify.delete(
        '/context/store/:instanceId', routeConfiguration(fastify),
        removeStoredContext
    );
}

// eslint-disable-next-line max-lines-per-function
async function loadContextConfiguration(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { contextId } = req.params as any;

    let status = 404;
    let result;

    const application = req.headers[APIHeader.KIX_APPLICATION];
    const cacheType = `${application}ContextConfiguration`;

    let configuration = await CacheService.getInstance().get(contextId, cacheType);

    if (!configuration) {
        await ConfigurationCache.getInstance().rebuildConfigCache().catch((error) => {
            LoggingService.getInstance().error('Error on rebuild context configurations', error);
            result = error;
        });

        configuration = await CacheService.getInstance().get(contextId, cacheType);
    }

    if (configuration) {
        result = { configuration };
        status = 200;
    }

    return reply.status(status).send(result);
}

async function loadContextConfigurations(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const configurations = [];

    const { application } = APIUtil.getRequestData(req);
    const beToken = ConfigurationService.getBackendAPIToken();

    const loadingOptions = new KIXObjectLoadingOptions([
        new FilterCriteria(
            SysConfigOptionProperty.CONTEXT, SearchOperator.EQUALS, FilterDataType.STRING,
            FilterType.AND, application
        )
    ]);

    let status = 404;

    const objectResponse = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
        beToken, 'ContextConfiguration', KIXObjectType.SYS_CONFIG_OPTION, null,
        loadingOptions, null
    );
    const options = objectResponse?.objects || [];
    const contextOptions = options.filter((c) => c.ContextMetadata === 'Context');

    const cacheType = `${application}ContextConfiguration`;
    for (const contextOption of contextOptions) {
        const configuration = await CacheService.getInstance().get(contextOption.Name, cacheType);

        if (configuration) {
            configurations.push(configuration);
        }
    }

    const result = { configurations };
    status = 200;

    return reply.status(status).send(result);
}

async function loadStoredContexts(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);

    let contextList: ContextPreference[] = [];
    const user = await UserService.getInstance().getUserByToken(token).catch((): User => null);
    if (user) {
        const fileName = getContextListFileName(user);
        contextList = await CacheService.getInstance().get(fileName);
        if (!contextList) {
            contextList = ConfigurationService.getInstance().getDataFileContent(fileName, []);
            CacheService.getInstance().set(fileName, contextList);
        }
    }

    const result = { contextList };
    return reply.status(200).send(result);
}

async function storeContext(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);

    const user = await UserService.getInstance().getUserByToken(token).catch((): User => null);
    if (user) {
        const contextPreference = req.body;
        await PromiseQueue.getInstance().enqueue(createStoreContextPromise.bind(this), [user, contextPreference]);
    }

    return reply.status(201).send();
}

async function createStoreContextPromise(user: User, contextPreference: ContextPreference): Promise<void> {
    const fileName = getContextListFileName(user);
    let contextList = await CacheService.getInstance().get(fileName);
    if (!contextList) {
        contextList = ConfigurationService.getInstance().getDataFileContent(fileName, []);
        CacheService.getInstance().set(fileName, contextList);
    }

    const index = contextList
        .filter((c) => c !== null && typeof c !== 'undefined')
        .findIndex((cp) => cp?.instanceId === contextPreference?.instanceId);
    if (index !== -1) {
        contextList.splice(index, 1);
    }

    if (contextPreference) {
        contextList.push(contextPreference);
    }

    CacheService.getInstance().set(fileName, contextList);
    ConfigurationService.getInstance().saveDataFileContent(fileName, contextList);
}

async function removeStoredContext(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { instanceId } = req.params as any;
    const { token } = APIUtil.getRequestData(req);

    const user = await UserService.getInstance().getUserByToken(token).catch((): User => null);
    if (user) {
        await PromiseQueue.getInstance().enqueue(createRemoveStoredContextPromise.bind(this), [user, instanceId]);
    }

    return reply.status(204).send();
}

async function createRemoveStoredContextPromise(user: User, instanceId: string): Promise<void> {
    const fileName = getContextListFileName(user);
    let contextList = await CacheService.getInstance().get(fileName);
    if (!contextList) {
        contextList = ConfigurationService.getInstance().getDataFileContent(fileName, []);
    }

    const index = contextList
        .filter((c) => c !== null && typeof c !== 'undefined')
        .findIndex((cp) => cp?.instanceId === instanceId);
    if (index !== -1) {
        contextList.splice(index, 1);
    }

    CacheService.getInstance().set(fileName, contextList);
    ConfigurationService.getInstance().saveDataFileContent(fileName, contextList);
}

function getContextListFileName(user: User): string {
    return `${user.UserID}_ContextList.json`;
}

async function rebuildConfiguration(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    let status = 201;
    let result;

    await ConfigurationCache.getInstance().rebuildConfigCache().catch((error) => {
        LoggingService.getInstance().error('Error on rebuild context configurations', error);
        status = 400;
        result = error;
    });

    return reply.status(status).send(result);
}

export default routes;