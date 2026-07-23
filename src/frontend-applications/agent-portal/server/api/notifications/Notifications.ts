/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PortalNotificationService } from '../../../modules/portal-notification/server/PortalNotificationService';
import { APIUtil } from '../APIUtil';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { ClientNotificationService } from '../../services/ClientNotificationService';
import { routeConfiguration } from '../../routes/FastifyAuthentication';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/notifications/:userType', loadNotifications);
    fastify.get('/notifications/prelogin/:userType', loadPreloginNotifications);
    fastify.get('/notifications/backend', waitForBackendNotifications);
    fastify.get('/notifications/portal', waitForPortalNotifications);
}

async function loadNotifications(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { userType } = (req as any).params;
    const notifications = PortalNotificationService.getInstance().getNotifications(userType) || [];
    return reply.status(200).send({ notifications });
}

async function loadPreloginNotifications(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { userType } = (req as any).params;
    const notifications = PortalNotificationService.getInstance().getPreLoginNotifications(userType) || [];
    return reply.status(200).send({ notifications });
}


async function waitForBackendNotifications(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token } = APIUtil.getRequestData(req);
    if (token) {
        const lastEventKey = Number(APIUtil.getQueryValue(req, 'eventKey'));

        const { eventKey, notifications } = ClientNotificationService.getInstance().getEvents(lastEventKey);
        reply.status(200).send({ eventKey, notifications });
    }
    else {
        setTimeout(() => {
            reply.status(401).send();
        }, ConfigurationService.getEnvNumber('NOTIFICATION_ERROR_DELAY') || 5000);
    }

    return reply;
}

async function waitForPortalNotifications(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token, requestId } = APIUtil.getRequestData(req);
    if (token) {
        const timeout = setTimeout(() => {
            reply.status(200).send({ event: '' });

            PortalNotificationService.getInstance().removeListener(requestId);
        }, ConfigurationService.getEnvNumber('NOTIFICATION_POLLING_TIMEOUT') || 5000);

        PortalNotificationService.getInstance().registerNotificationListener(
            requestId,
            (event: string) => {
                clearTimeout(timeout);
                reply.status(200).send({ portalNotification: event });
                PortalNotificationService.getInstance().removeListener(requestId);
            }
        );
    }
    else {
        setTimeout(() => {
            reply.status(401).send();
        }, ConfigurationService.getEnvNumber('NOTIFICATION_ERROR_DELAY') || 5000);
    }

    return reply;
}

export default routes;