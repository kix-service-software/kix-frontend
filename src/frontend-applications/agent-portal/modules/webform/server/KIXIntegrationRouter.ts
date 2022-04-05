/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import cors from 'cors';

import { KIXRouter } from '../../../server/routes/KIXRouter';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { WebformService } from './WebformService';
import { Error } from '../../../../../server/model/Error';

export class KIXIntegrationRouter extends KIXRouter {

    private static INSTANCE: KIXIntegrationRouter;

    public static getInstance(): KIXIntegrationRouter {
        if (!KIXIntegrationRouter.INSTANCE) {
            KIXIntegrationRouter.INSTANCE = new KIXIntegrationRouter();
        }
        return KIXIntegrationRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    public getBaseRoute(): string {
        return '/integrations';
    }

    protected async initialize(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const forms = await WebformService.getInstance().loadWebforms(serverConfig.BACKEND_API_TOKEN);
        if (forms && !!forms.length) {
            for (const form of forms) {
                await this.registerRoute(Number(form.ObjectId));
            }
        }
        this.router.get(
            '/',
            this.handleUnsupportedGetRequest.bind(this)
        );
    }

    private async handleUnsupportedGetRequest(req: Request, res: Response): Promise<void> {
        res.sendStatus(404);
    }

    private async handleGetRequest(req: Request, res: Response): Promise<void> {
        if (req.path.match(/^\/\d+$/)) {
            const formId = Number(req.path.substring(1));

            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const form = await WebformService.getInstance().getWebform(serverConfig.BACKEND_API_TOKEN, formId);
            if (form && form.ValidID === 1) {
                const languages = req.acceptsLanguages();
                let userLanguage;
                let translations;
                if (languages && !!languages.length) {
                    userLanguage = languages[0].split('-')[0];
                    translations = await WebformService.getInstance().getWebformTranslationObject(
                        form, userLanguage
                    );
                }
                const template = require('../webapp/components/webform').default;
                const htmlString = template.renderToString({ webform: form, translations });
                res.status(200).json({
                    htmlString,
                    buttonLabel: form.buttonLabel,
                    modal: form.modal,
                    tooManyFilesErrorMsg: await WebformService.getInstance().getTooManyFilesErrorMsg(userLanguage),
                    fileTooBigErrorMsg: await WebformService.getInstance().getFileTooBigErrorMsg(userLanguage),
                    maxFileSize: await WebformService.getInstance().getMaxFileSize()
                });
            } else {
                this.handleUnsupportedGetRequest(req, res);
            }
        } else {
            this.handleUnsupportedGetRequest(req, res);
        }
    }

    private async handlePostRequest(req: Request, res: Response): Promise<void> {
        if (req.path.match(/^\/\d+$/)) {
            const formId = Number(req.path.substring(1));

            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const form = await WebformService.getInstance().getWebform(serverConfig.BACKEND_API_TOKEN, formId);
            if (form && form.ValidID === 1) {
                const languages = req.acceptsLanguages();
                const language = languages ? languages[0].split('-')[0] : null;
                WebformService.getInstance().createTicket(req.body, formId, language)
                    .then(async () => {
                        const successMessage = await WebformService.getInstance().getSuccessMessage(form, language);
                        res.status(201).json({ successMessage });
                    })
                    .catch((error) => {
                        res.status((error as Error).StatusCode ? error.StatusCode : 400)
                            .send((error as Error).Message ? error.Message : error);
                    });
            } else {
                this.handleUnsupportedGetRequest(req, res);
            }
        } else {
            this.handleUnsupportedGetRequest(req, res);
        }
    }

    private async getCorsOptions(req, callback): Promise<void> {
        let corsOptions;
        if (req.path.match(/^\/\d+$/)) {
            const formId = req.path.substring(1);
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const form = await WebformService.getInstance().getWebform(serverConfig.BACKEND_API_TOKEN, formId);
            if (form && form.ValidID === 1 && form.acceptedDomains) {
                let regex;
                try {
                    regex = new RegExp(form.acceptedDomains);
                } catch (error) {
                    // do nothing
                }
                if (regex) {
                    corsOptions = {
                        origin: regex
                    };
                }
            }
        }
        callback(null, corsOptions ? corsOptions : { origin: false });
    }

    public async registerRoute(formId: number): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const form = await WebformService.getInstance().getWebform(serverConfig.BACKEND_API_TOKEN, formId);
        if (form && form.acceptedDomains && !!form.acceptedDomains.length) {
            this.router.route(`/${formId}`)
                .options(cors(this.getCorsOptions.bind(this)))
                .get(
                    cors(this.getCorsOptions.bind(this)),
                    this.handleGetRequest.bind(this)
                ).post(
                    cors(this.getCorsOptions.bind(this)),
                    this.handlePostRequest.bind(this)
                );
        }
    }
}
