/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import { KIXRouter } from './KIXRouter';
import { WebformService } from '../services';
import { Error } from '../core/model';
import cors = require('cors');

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
        return "/integrations";
    }

    protected initialize(): void {
        const forms = WebformService.getInstance().loadWebforms();
        if (forms && !!forms.length) {
            forms.forEach((form) => {
                this.registerRoute(Number(form.ObjectId));
            });
        }
        this.router.get(
            "/",
            this.handleUnsupportedGetRequest.bind(this)
        );
    }

    private async handleUnsupportedGetRequest(req: Request, res: Response): Promise<void> {
        res.statusCode = 404;
        res.send();
    }

    private async handleGetRequest(req: Request, res: Response): Promise<void> {
        if (req.path.match(/^\/\d+$/)) {
            const formId = req.path.substring(1);
            const forms = WebformService.getInstance().loadWebforms();
            if (forms && forms.length) {
                const form = forms.find((f) => f.ObjectId === Number(formId));
                if (form && form.ValidID === 1) {
                    const languages = req.acceptsLanguages();
                    let translations;
                    if (languages && !!languages.length) {
                        translations = await WebformService.getInstance().getWebformTranslationObject(
                            form, languages[0].split('-')[0]
                        );
                    }
                    const template = require('../components/integrations/webform');
                    const htmlString = template.renderToString({ webform: form, translations });
                    res.status(200);
                    res.json({
                        htmlString,
                        buttonLabel: form.buttonLabel,
                        modal: form.modal
                    });
                } else {
                    this.handleUnsupportedGetRequest(req, res);
                }
            } else {
                this.handleUnsupportedGetRequest(req, res);
            }
        } else {
            this.handleUnsupportedGetRequest(req, res);
        }
    }

    private async handlePostRequest(req: Request, res: Response): Promise<void> {
        if (req.path.match(/^\/\d+$/)) {
            const formId = req.path.substring(1);
            const forms = WebformService.getInstance().loadWebforms();
            if (forms && forms.length) {
                const form = forms.find((f) => f.ObjectId === Number(formId));
                if (form && form.ValidID === 1) {
                    const languages = req.acceptsLanguages();
                    const language = languages ? languages[0].split('-')[0] : null;
                    const successMessage = await WebformService.getInstance().getSuccessMessage(form, language);
                    WebformService.getInstance().createTicket(req.body, form, language)
                        .then(async () => {
                            res.status(201);
                            res.json({ successMessage });
                        })
                        .catch((error) => {
                            res.status((error as Error).StatusCode ? error.StatusCode : 400);
                            res.send((error as Error).Message ? error.Message : error);
                        });
                } else {
                    this.handleUnsupportedGetRequest(req, res);
                }
            } else {
                this.handleUnsupportedGetRequest(req, res);
            }
        } else {
            this.handleUnsupportedGetRequest(req, res);
        }
    }

    public registerRoute(formId: number): void {
        const forms = WebformService.getInstance().loadWebforms();
        if (forms && forms.length) {
            const form = forms.find((f) => f.ObjectId === Number(formId));
            if (form && form.acceptedDomains && !!form.acceptedDomains.length) {
                const corsOptions = {
                    origin: form.acceptedDomains.map((d) => {
                        if (d.match(/^\/.+\/$/)) {
                            return new RegExp(d.substr(1, d.length - 2));
                        } else {
                            return d;
                        }
                    })
                };
                this.router.route(`/${formId}`)
                    .options(cors(corsOptions))
                    .get(
                        cors(corsOptions),
                        this.handleGetRequest.bind(this)
                    ).post(
                        cors(corsOptions),
                        this.handlePostRequest.bind(this)
                    );
            }
        }
    }

    public unregisterRoute(formId: number): void {
        // TODO: remove route/handle, if necessary, currently it should end in "handleUnsupportedGetRequest"
    }
}
