/**
 * Copyright (C) 2006-2026 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { LoggingService } from '../../../../server/services/LoggingService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../services/KIXObjectServiceRegistry';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/oauth2redirect', handleOAuth2Redirect);
}

async function handleOAuth2Redirect(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { state, code, error } = req.query as any;

    if (state && code) {
        const sendError = await sendAuthCode(state, code);
        const template = require('../../modules/oauth2/webapp/components/redirect-result').default;
        if (sendError) {
            const htmlString = template.renderToString({ failed: true, message: sendError });
            reply.status(400).header('Content-Type', 'text/html').send(htmlString);
        } else {
            const htmlString = template.renderToString({
                failed: false, message: 'Authorization process successfull and access token obtained.'
            });
            reply.status(200).header('Content-Type', 'text/html').send(htmlString);
        }
    } else if (error) {
        const errordescription = req.query['error_description']?.toString();
        const errorMessage = error + (errordescription ? ' - ' + errordescription : '');
        LoggingService.getInstance().error(
            'OAuth2 profile renew authorization failed: ' + errorMessage
        );
        reply.status(400).send(errorMessage);
    } else {
        reply.status(400).send();
    }
}

async function sendAuthCode(state: string, code: string): Promise<string> {
    let errorMessage;
    const service = KIXObjectServiceRegistry.getServiceInstance(KIXObjectType.OAUTH2_PROFILE_AUTH);
    if (service) {
        await service.createObject(
            ConfigurationService.getBackendAPIToken(),
            'oauth2-profile-redirect', KIXObjectType.OAUTH2_PROFILE_AUTH,
            [
                ['Code', code],
                ['State', state]
            ],
            undefined, undefined
        ).catch((error) => {
            errorMessage = error.Code ? (error.Code + ': ' + error.Message)
                : 'Something went wrong - see logs for details!';
        });
    } else {
        errorMessage = 'No API service registered for object type ' + KIXObjectType.OAUTH2_PROFILE_AUTH;
        LoggingService.getInstance().error(errorMessage);
    }
    return errorMessage;
}

export default routes;
