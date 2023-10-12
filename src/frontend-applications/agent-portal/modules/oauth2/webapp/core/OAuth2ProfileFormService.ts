/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { OAuth2Profile } from '../../model/OAuth2Profile';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormContext } from '../../../../model/configuration/FormContext';
import { OAuth2ProfileProperty } from '../../model/OAuth2ProfileProperty';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';

export class OAuth2ProfileFormService extends KIXObjectFormService {

    private static INSTANCE: OAuth2ProfileFormService = null;

    public static getInstance(): OAuth2ProfileFormService {
        if (!OAuth2ProfileFormService.INSTANCE) {
            OAuth2ProfileFormService.INSTANCE = new OAuth2ProfileFormService();
        }

        return OAuth2ProfileFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.OAUTH2_PROFILE;
    }

    protected async getValue(
        property: string, value: any, object: OAuth2Profile, formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        if (formContext === FormContext.NEW && property === OAuth2ProfileProperty.URL_REDIRECT) {

            const fqdnConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.FQDN], null, null, true
            ).catch((error): SysConfigOption[] => []);
            if (fqdnConfig?.length && typeof fqdnConfig[0].Value === 'object' && fqdnConfig[0].Value['Frontend']) {
                return `https://${fqdnConfig[0].Value['Frontend']}/oauth2redirect`;
            }
        }
        return super.getValue(property, value, object, formField, formContext);
    }
}
