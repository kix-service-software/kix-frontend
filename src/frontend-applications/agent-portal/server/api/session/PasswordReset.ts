import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PasswordResetState } from '../../../model/PasswordResetState';
import { AuthenticationService } from '../../../../../server/services/AuthenticationService';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';

async function routes(fastify: FastifyInstance, options): Promise<void> {
    fastify.post('/password-reset', resetPassword);
    fastify.get('/auth/password-reset/:resetToken', sendUserPasswordResetRequestConfirmation);
}

async function resetPassword(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { userLogin, userType } = (req as any).params;
    const response = await AuthenticationService.getInstance().createUserPasswordResetRequest(userLogin, userType);
    return response;
}

async function sendUserPasswordResetRequestConfirmation(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const resetToken = (req.params as any)?.resetToken?.toString();

    let pwResetState = PasswordResetState.ERROR;

    if (resetToken) {
        pwResetState = await AuthenticationService.getInstance().sendUserPasswordResetRequestConfirmation(
            resetToken
        );
    }

    const baseRoute = ConfigurationService.getEnvString('BASE_ROUTE') || '';
    reply.redirect(`${baseRoute}/auth?pwResetState=${pwResetState}`);
}

export default routes;