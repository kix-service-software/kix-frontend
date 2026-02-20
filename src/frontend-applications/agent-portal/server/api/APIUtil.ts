import { FastifyRequest } from 'fastify';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ObjectIcon } from '../../modules/icon/model/ObjectIcon';
import { SysConfigKey } from '../../modules/sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../modules/sysconfig/model/SysConfigOption';
import { SysConfigService } from '../../modules/sysconfig/server/SysConfigService';
import { ObjectIconLoadingOptions } from '../model/ObjectIconLoadingOptions';
import { KIXObjectServiceRegistry } from '../services/KIXObjectServiceRegistry';
import { ObjectResponse } from '../services/ObjectResponse';
import { APIHeader } from './APIHeader';

export class APIUtil {

    public static readonly URL_PREFIX = '/api/v1';

    public static getRequestData(req: FastifyRequest): any {
        const application = req.headers[APIHeader.KIX_APPLICATION]?.toString();
        const clientRequestId = APIUtil.getClientRequestId(req);
        const token = APIUtil.getToken(req, application);
        const requestId = req.headers[APIHeader.KIX_HEADER_REQUEST_ID];
        const relevantOrganisationId = req.headers[APIHeader.KIX_HEADER_RELEVANT_ORG_ID];
        const profileRequestId = `${clientRequestId}#${requestId}`;
        const baseRoute = req.headers[APIHeader.KIX_HEADER_BASE_ROUTE] || '';
        return {
            token, clientRequestId, requestId, application, profileRequestId, relevantOrganisationId,
            baseRoute
        };
    }

    public static getHeaderValue(req: FastifyRequest, header: string): string {
        return req.headers[header]?.toString();
    }

    public static getToken(req: FastifyRequest, application: string): string {
        return req[`${application}-session`]?.get('session');
    }

    public static getClientRequestId(req: FastifyRequest): string {
        const application = APIUtil.getHeaderValue(req, APIHeader.KIX_APPLICATION);
        return (req as any).cookies[`${application}-clientRequestId`];
    }

    public static async getIcon(name: string): Promise<ObjectIcon> {
        const beToken = ConfigurationService.getBackendAPIToken();
        if (beToken) {
            // FIXME: do not use ObjectIconAPIService directly, there is a circular reference somewhere
            const service = KIXObjectServiceRegistry.getServiceInstance(KIXObjectType.OBJECT_ICON);
            if (service) {
                const logoLoadingOptions = new ObjectIconLoadingOptions(name, name, true);
                const objectResponse = await service.loadObjects<ObjectIcon>(
                    beToken, '', KIXObjectType.OBJECT_ICON, null, null, logoLoadingOptions
                ).catch(() => new ObjectResponse<ObjectIcon>());

                const icons = objectResponse?.objects || [];
                return icons?.length ? icons[0] : null;
            }
        }
        return null;
    }

    public static async getImprintLink(): Promise<string> {
        let imprintLink = '';
        const objectResponse = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            ConfigurationService.getBackendAPIToken(), '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.IMPRINT_LINK],
            undefined, undefined
        ).catch(() => new ObjectResponse<SysConfigOption>());

        const imprintConfig = objectResponse?.objects || [];

        if (imprintConfig && imprintConfig.length) {
            const data = imprintConfig[0].Value;

            const response = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                ConfigurationService.getBackendAPIToken(), '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.DEFAULT_LANGUAGE],
                undefined, undefined
            ).catch(() => new ObjectResponse<SysConfigOption>());

            const defaultLangConfig = response?.objects || [];
            if (defaultLangConfig && defaultLangConfig.length) {
                imprintLink = data[defaultLangConfig[0].Value];
            } else {
                imprintLink = data['en'];
            }
        }

        return imprintLink;
    }

    public static getRoutes(): any[] {
        return [
            require('./session/Session'),
            require('./session/MFA'),
            require('./context/Context'),
            require('./object/Object'),
            require('./admin/Admin'),
            require('./config/Form'),
            require('./config/Config'),
            require('./note/Note'),
            require('./user/User'),
            require('./ticket/Ticket'),
            require('./search/Search'),
            require('./webform/Webform'),
            require('./notifications/Notifications'),
            require('./file/File')
        ];
    }

}