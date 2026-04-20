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
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { IdService } from '../../../model/IdService';
import { SearchCache } from '../../../modules/search/model/SearchCache';
import { SearchRepository } from './SearchRepository';
import { routeConfiguration } from '../../routes/FastifyAuthentication';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/search', routeConfiguration(fastify), loadSearches);
    fastify.get('/search/shared', routeConfiguration(fastify), loadSharedSearches);
    fastify.post('/search', routeConfiguration(fastify), saveSearch);
    fastify.delete('/search/:searchId', routeConfiguration(fastify), deleteSearch);
    fastify.get('/search/default/:objectType', routeConfiguration(fastify), loadSearchDefault);
    fastify.post('/search/default', routeConfiguration(fastify), saveSearchAsDefault);
    fastify.delete('/search/default/:objectType', routeConfiguration(fastify), deleteUserSearchDefault);
}

async function loadSearches(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);

    const status = 200;
    let result = { search: [] };

    const user = await UserService.getInstance().getUserByToken(token);

    const searchPreference = user?.Preferences?.find((p) => p.ID?.endsWith('searchprofiles'));
    const searchConfigs = [];
    if (searchPreference) {
        const search = JSON.parse(searchPreference.Value);
        const deleteSearches: string[] = [];
        for (const s in search) {
            if (search[s]) {
                if (!search[s].id) {
                    search[s].id = IdService.generateDateBasedId('SearchCache');
                    deleteSearches.push(s);
                    await this.saveUserSearch(search[s], false, token);
                }
                searchConfigs.push(search[s]);
            }
        }

        for (const s of deleteSearches) {
            await this.deleteUserSearch(s, token);
        }

        result = { search: searchConfigs };
    }

    return reply.status(status).send(result);
}

function loadSharedSearches(req: FastifyRequest, reply: FastifyReply): any {
    const status = 200;
    let result = {};
    const fileName = 'shared_searches.json';
    const sharedSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(fileName, []) || [];
    result = { search: sharedSearches };

    return reply.status(status).send(result);
}

async function loadSearchDefault(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    const { objectType } = req.params as any;

    let status = 200;
    let result = {};

    try {
        const user = await UserService.getInstance().getUserByToken(token);
        const defaultSearch = SearchRepository.loadUserSearchDefault(objectType, user);
        result = { search: defaultSearch };
    } catch (e) {
        status = 400;
        result = e;
    }

    return reply.status(status).send(result);
}

async function saveSearch(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    const { search, share } = req.body as any;

    let status = 201;
    let result = {};

    if (search) {
        await SearchRepository.saveUserSearch(search, share, token).catch((e) => {
            status = 400;
            result = e;
        });
    } else {
        status = 400;
        result = 'No search given!';
    }

    return reply.status(status).send(result);
}

async function saveSearchAsDefault(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    const { search } = req.body as any;

    let status = 201;
    let result = {};

    if (search) {
        try {
            const user = await UserService.getInstance().getUserByToken(token);
            SearchRepository.saveUserSearchAsDefault(search, user);
        } catch (e) {
            status = 400;
            result = e;
        }
    } else {
        status = 400;
        result = 'No search given!';
    }

    return reply.status(status).send(reply);
}

async function deleteSearch(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    const { searchId } = req.params as any;

    let status = 200;
    let result = {};

    if (searchId) {
        await SearchRepository.deleteUserSearch(searchId, token);
        SearchRepository.deleteSharedSearch(searchId);
    } else {
        status = 400;
        result = 'No searchId given!';
    }

    return reply.status(status).send(result);
}

async function deleteUserSearchDefault(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    const { objectType } = req.params as any;

    let status = 200;
    let result = {};

    if (objectType) {
        try {
            const user = await UserService.getInstance().getUserByToken(token);
            SearchRepository.deleteDefault(objectType, user);
        } catch (e) {
            status = 400;
            result = e;
        }
    } else {
        status = 400;
        result = 'No objectType given!';
    }

    return reply.status(status).send(result);
}

export default routes;