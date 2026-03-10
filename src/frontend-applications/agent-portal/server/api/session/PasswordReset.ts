/**
 * Copyright (C) 2006-2026 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationService } from '../../../../../server/services/AuthenticationService';
import { PasswordResetRequest } from '../../../modules/user/model/PasswordResetRequest';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.post('/password-reset', resetPassword);
}

async function resetPassword(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { UserLogin, UserType } = req.body as PasswordResetRequest;
    const response = await AuthenticationService.getInstance().createUserPasswordResetRequest(UserLogin, UserType);
    return response;
}

export default routes;