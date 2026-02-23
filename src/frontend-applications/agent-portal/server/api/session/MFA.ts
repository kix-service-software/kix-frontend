/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MFAService } from '../../../modules/multifactor-authentication/server/MFAService';
import { MFAUserRequest } from '../../../modules/multifactor-authentication/model/MFAUserRequest';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.get('/session/mfa', checkForMFA);
    fastify.get('/session/mfa/configs', loadMFAConfigs);
}

async function checkForMFA(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { login, userType, mfaConfig } = (req as any).params;
    try {
        const config = JSON.parse(mfaConfig);
        const mfaEnabled = await MFAService.getInstance().isUserMFAPEnabled(login, userType, config);
        reply.status(200).send({ mfaEnabled });
    } catch (e) {
        reply.status(400).send('Could not parse mfaConfig param.');
    }
}

async function loadMFAConfigs(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { userType } = req.params as MFAUserRequest;
    const mfaConfigs = await MFAService.getInstance().loadMFAConfigs(userType);
    reply.status(200).send({ configs: mfaConfigs });
}

export default routes;