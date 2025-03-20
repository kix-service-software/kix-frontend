/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import cors = require('cors');

import { KIXRouter } from '../../../server/routes/KIXRouter';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXModulesService } from '../../base-components/webapp/core/KIXModulesService';

export class ProfileRedirectRouter extends KIXRouter {

    private static INSTANCE: ProfileRedirectRouter;

    public static getInstance(): ProfileRedirectRouter {
        if (!ProfileRedirectRouter.INSTANCE) {
            ProfileRedirectRouter.INSTANCE = new ProfileRedirectRouter();
        }
        return ProfileRedirectRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    public getBaseRoute(): string {
        return '/oauth2redirect';
    }

    protected async initialize(): Promise<void> {
        this.router.route('/')
            .options(cors(this.getCorsOptions.bind(this)))
            .get(
                cors(this.getCorsOptions.bind(this)),
                this.handleGetRequest.bind(this)
            );
    }

    private async handleUnsupportedGetRequest(req: Request, res: Response): Promise<void> {
        res.sendStatus(404);
    }

    private getCorsOptions(req, callback): void {

        // TODO: allow everything for now
        callback(null, { origin: new RegExp('.+') });
    }

    private async handleGetRequest(req: Request, res: Response): Promise<void> {
        if (req?.query) {
            if (req.query.state && req.query.code) {
                const error = await this.sendAuthCode(req?.query?.state?.toString(), req?.query?.code?.toString());
                const template = require('../webapp/components/redirect-result').default;
                if (error) {
                    const htmlString = template.renderToString({ failed: true, message: error });
                    res.status(400).send(htmlString);
                } else {
                    const htmlString = template.renderToString({
                        failed: false, message: 'Authorization process successfull and access token obtained.'
                    });
                    res.status(200).send(htmlString);
                }
            } else if (req.query.error) {
                const errorMessage = req.query.error
                    + (req.query.error_description ? ' - ' + req.query.error_description : '');
                LoggingService.getInstance().error(
                    'OAuth2 profile renew authorization failed: ' + errorMessage
                );
                res.status(400).send(
                    req.query.error + (req.query.error_description ? ' - ' + req.query.error_description : '')
                );
            } else {
                this.handleUnsupportedGetRequest(req, res);
            }
        } else {
            this.handleUnsupportedGetRequest(req, res);
        }
    }

    private async sendAuthCode(state: string, code: string): Promise<string> {
        let errorMessage;
        const service = KIXObjectServiceRegistry.getServiceInstance(KIXObjectType.OAUTH2_PROFILE_AUTH);
        if (service) {
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            await service.createObject(
                serverConfig.BACKEND_API_TOKEN,
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
}
