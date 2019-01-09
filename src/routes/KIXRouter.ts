import { Request, Response, Router } from 'express';

import { IRouter } from './IRouter';
import { IServerConfiguration, BaseTemplateInput } from '../core/common';
import {
    ProfilingService, ConfigurationService, UserService, ServiceService, ValidObjectService,
    ContactService, CustomerService, ObjectDefinitionService
} from '../core/services';
import { ObjectData, ReleaseInfo } from '../core/model';

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
            data: new BaseTemplateInput(contextId, objectData, objectId)
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
        const users = await UserService.getInstance().getUsers(token);
        const currentUser = await UserService.getInstance().getUserByToken(token);

        const services = await ServiceService.getInstance().getServices(token);
        const servicesHierarchy = await ServiceService.getInstance().getServiceHierarchy(token);

        const validObjects = await ValidObjectService.getInstance().getValidObjects(token);

        const contactAttributeMapping = await ContactService.getInstance().getAttributeMapping(token);
        const contactAttributes: Array<[string, string]> = [];
        contactAttributeMapping
            .filter((cam) => cam.Searchable)
            .forEach((cam) => contactAttributes.push([cam.Attribute, cam.Label]));

        const customerAttributeMapping = await CustomerService.getInstance().getAttributeMapping(token);
        const customerAttributes: Array<[string, string]> = [];
        customerAttributeMapping
            .filter((cam) => cam.Searchable)
            .forEach((cam) => customerAttributes.push([cam.Attribute, cam.Label]));

        // TODO: hier oder wo gebraucht aus den objectDefinitions ermitteln
        const faqVisibilities: Array<[string, string]> = [
            ["internal", "intern"], ["external", "extern"], ["public", "öffentlich"]
        ];

        const objectDefinitions = await ObjectDefinitionService.getInstance().getObjectDefinitions(token);

        const bookmarks = await ConfigurationService.getInstance().getBookmarks();

        const releaseInfo =
            (await ConfigurationService.getInstance().getModuleConfiguration('release-info', null) as ReleaseInfo);

        const socketTimeout = ConfigurationService.getInstance().getServerConfiguration().SOCKET_TIMEOUT;

        const objectData = new ObjectData(
            services, servicesHierarchy,
            users, currentUser,
            validObjects,
            contactAttributes, customerAttributes,
            faqVisibilities,
            objectDefinitions,
            bookmarks,
            releaseInfo,
            socketTimeout
        );

        return objectData;
    }
}
