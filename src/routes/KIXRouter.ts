import { Request, Response, Router } from 'express';

import { IRouter } from './IRouter';
import { IServerConfiguration } from '../core/common';
import {
    ProfilingService, ConfigurationService, ValidObjectService, ObjectDefinitionService
} from '../core/services';
import { ObjectData, ReleaseInfo, KIXObjectType, ValidObject } from '../core/model';

export abstract class KIXRouter implements IRouter {

    protected router: Router;
    protected serverConfig: IServerConfiguration;

    private appTemplate: any;

    public constructor() {
        this.router = Router();
        this.serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        this.initialize();
    }

    public getRouter(): Router {
        return this.router;
    }

    public setAppTemplate(appTemplate: any): void {
        this.appTemplate = appTemplate;
    }

    public abstract getBaseRoute(): string;

    protected abstract initialize(): void;

    protected async prepareMarkoTemplate(
        res: Response, contextId: string, objectId: string, objectData: ObjectData,
        themeCSS?: string, specificCSS: string[] = []
    ): Promise<void> {

        // start profiling
        const profileTaskId = ProfilingService.getInstance().start(
            'KIXRouter',
            contextId + (objectId ? '/' + objectId : ''),
        );

        this.setFrontendSocketUrl(res);

        res.marko(this.appTemplate, {
            themeCSS,
            specificCSS,
            data: { objectData }
        });

        // stop profiling
        ProfilingService.getInstance().stop(profileTaskId,
            {
                a: objectData,
                b: themeCSS,
                c: specificCSS,
                d: this.appTemplate,
            }
        );
    }

    protected getServerUrl(): string {
        return this.serverConfig.FRONTEND_URL;
    }

    protected async getToken(req: Request): Promise<string> {
        const token = req.cookies.token;
        return token;
    }

    protected setContextId(contextId: string, res: Response): void {
        res.cookie('contextId', contextId);
    }

    protected setFrontendSocketUrl(res: Response): void {
        res.cookie('frontendSocketUrl', this.getServerUrl());
    }

    protected async getObjectData(token: string): Promise<ObjectData> {
        const validObjects = await ValidObjectService.getInstance().loadObjects<ValidObject>(
            token, null, KIXObjectType.VALID_OBJECT, null, null, null
        ).catch(() => []);

        const faqVisibilities: Array<[string, string]> = [
            ["internal", "Translatable#internal"],
            ["external", "Translatable#external"],
            ["public", "Translatable#public"]
        ];

        const objectDefinitions = await ObjectDefinitionService.getInstance().getObjectDefinitions(token)
            .catch(() => []);

        const bookmarks = await ConfigurationService.getInstance().getBookmarks();

        const releaseInfo =
            (await ConfigurationService.getInstance().getModuleConfiguration('release-info', null) as ReleaseInfo);

        const socketTimeout = ConfigurationService.getInstance().getServerConfiguration().SOCKET_TIMEOUT;

        const objectData = new ObjectData(
            validObjects,
            faqVisibilities,
            objectDefinitions,
            bookmarks,
            releaseInfo,
            socketTimeout
        );

        return objectData;
    }
}
