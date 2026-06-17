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
import { KIXObjectServiceRegistry } from '../../services/KIXObjectServiceRegistry';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';

import { routeConfiguration } from '../../routes/FastifyAuthentication';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/object/:objectType/:objectIds?', routeConfiguration(fastify), loadObjects);
    fastify.post('/object/:objectType', routeConfiguration(fastify), createObject);
    fastify.post('/object/:objectType/commit', routeConfiguration(fastify), commitObject);
    fastify.patch('/object/:objectType/:objectId', routeConfiguration(fastify), updateObject);
    fastify.delete('/object/:objectType/:objectId', routeConfiguration(fastify), deleteObject);
    fastify.get('/object/:objectType/:objectId/displayvalue', routeConfiguration(fastify), loadDisplayValue);
}

// eslint-disable-next-line max-lines-per-function
async function loadObjects(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { objectType } = req.params as any;
    let { objectIds } = req.params as any;

    if (typeof objectIds === 'string') {
        objectIds = decodeURIComponent(objectIds).split(',');
    }

    let loadingOptions: KIXObjectLoadingOptions;
    try {
        loadingOptions = JSON.parse((req.query as any).loadingOptions);
    } catch (error) { };


    let objectLoadingOptions: KIXObjectSpecificLoadingOptions;
    try {
        objectLoadingOptions = JSON.parse((req.query as any).objectLoadingOptions);
    } catch (error) { }

    let status = 400;
    let result;
    const service = KIXObjectServiceRegistry.getServiceInstance(objectType);
    if (service) {
        const { token, profileRequestId, relevantOrganisationId } = APIUtil.getRequestData(req);
        if (relevantOrganisationId) {
            if (!loadingOptions) {
                loadingOptions = new KIXObjectLoadingOptions();
            }
            loadingOptions.query.push(['RelevantOrganisationID', relevantOrganisationId]);
        }

        const objectResponse = await service.loadObjects(
            token, profileRequestId, objectType, objectIds,
            loadingOptions, objectLoadingOptions
        );

        status = 200;
        result = { objects: objectResponse?.objects, totalCount: objectResponse?.totalCount };
    } else {
        const errorMessage = 'No API service registered for object type ' + objectType;
        LoggingService.getInstance().error(errorMessage);
        result = errorMessage;
    }

    return reply.status(status).send(result);
}

async function createObject(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { objectType } = req.params as any;
    const { commit } = req.query as any;

    if (Number(commit) === 1) {
        return commitObject(req, reply);
    }

    const createData = req.body as any;

    let status = 400;
    let result = {};
    const service = KIXObjectServiceRegistry.getServiceInstance(objectType);
    if (service) {
        const { token, profileRequestId } = APIUtil.getRequestData(req);
        const id = await service.createObject(
            token, profileRequestId, objectType, createData.parameter, createData.createOptions, objectType
        );
        result = { id };
        status = 201;
    } else {
        const errorMessage = 'No API service registered for object type ' + objectType;
        LoggingService.getInstance().error(errorMessage);
        result = errorMessage;
    }

    return reply.status(status).send(result);
}

async function updateObject(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { objectType, objectId } = req.params as any;

    const { parameter, updateOptions } = req.body as any;

    let status = 400;
    let result = {};

    const service = KIXObjectServiceRegistry.getServiceInstance(objectType);
    if (service) {
        const { token, profileRequestId } = APIUtil.getRequestData(req);
        const id = await service.updateObject(
            token, profileRequestId, objectType, parameter, objectId, updateOptions, objectType
        );
        status = 200;
        result = { id };
    } else {
        const errorMessage = 'No API service registered for object type ' + objectType;
        LoggingService.getInstance().error(errorMessage);
        result = errorMessage;
    }

    return reply.status(status).send(result);
}

async function deleteObject(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { objectType, objectId } = req.params as any;

    let status = 204;
    let result = {};
    const service = KIXObjectServiceRegistry.getServiceInstance(objectType);
    if (service) {
        const { token, profileRequestId } = APIUtil.getRequestData(req);
        await service.deleteObject(token, profileRequestId, objectType, objectId, objectType)
            .catch((e) => {
                status = 400;
                result = e;
            });
    } else {
        const errorMessage = 'No API service registered for object type ' + objectType;
        LoggingService.getInstance().error(errorMessage);
        result = errorMessage;
    }

    return reply.status(status).send(result);
}

async function loadDisplayValue(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { objectType, objectId } = req.params as any;

    let displayValue = '';
    const service = KIXObjectServiceRegistry.getServiceInstance(objectType);
    if (service) {
        displayValue = await service.loadDisplayValue(objectType, objectId);
    }

    return reply.status(200).send({ displayValue });
}

async function commitObject(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token, profileRequestId, relevantOrganisationId } = APIUtil.getRequestData(req);
    const { objectType } = req.params as any;
    const { object } = req.body as any;

    const status = 201;
    let result = {};

    const service = KIXObjectServiceRegistry.getServiceInstance(objectType);
    if (service) {
        const id = await service.commitObject(token, profileRequestId, object, relevantOrganisationId);
        result = { id };
    } else {
        const errorMessage = 'No API service registered for object type ' + objectType;
        LoggingService.getInstance().error(errorMessage);
    }

    return reply.status(status).send(result);
}

export default routes;