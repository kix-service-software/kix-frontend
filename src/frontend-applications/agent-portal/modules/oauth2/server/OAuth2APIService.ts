/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { OAuth2Profile } from '../model/OAuth2Profile';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { Error } from '../../../../../server/model/Error';
import { OAuth2ProfileProperty } from '../model/OAuth2ProfileProperty';
import { AuthURLLoadingOptions } from '../model/AuthURLLoadingOptions';
import { CacheService } from '../../../server/services/cache';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class OAuth2APIService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = this.buildUri('system', 'oauth2', 'profiles');

    private static INSTANCE: OAuth2APIService;

    public static getInstance(): OAuth2APIService {
        if (!OAuth2APIService.INSTANCE) {
            OAuth2APIService.INSTANCE = new OAuth2APIService();
        }
        return OAuth2APIService.INSTANCE;
    }

    public objectType: KIXObjectType = KIXObjectType.OAUTH2_PROFILE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);

        CacheService.getInstance().addDependencies(
            KIXObjectType.OAUTH2_PROFILE_AUTH, [KIXObjectType.OAUTH2_PROFILE]
        );
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType
            || kixObjectType === KIXObjectType.OAUTH2_PROFILE_AUTH_URL
            || kixObjectType === KIXObjectType.OAUTH2_PROFILE_AUTH;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse();
        if (objectType === KIXObjectType.OAUTH2_PROFILE) {
            objectResponse = await super.load<OAuth2Profile>(
                token, KIXObjectType.OAUTH2_PROFILE, this.RESOURCE_URI, loadingOptions, objectIds,
                'Profile', clientRequestId, OAuth2Profile
            );
        } else if (objectType === KIXObjectType.OAUTH2_PROFILE_AUTH_URL) {
            if (
                objectLoadingOptions && (objectLoadingOptions as AuthURLLoadingOptions).profileId
            ) {
                const uri = this.buildUri(
                    this.RESOURCE_URI, (objectLoadingOptions as AuthURLLoadingOptions).profileId, 'authurl'
                );

                // get url never from cache (backend state handling)
                objectResponse = await super.load<string>(
                    token, KIXObjectType.OAUTH2_PROFILE_AUTH_URL, uri, loadingOptions, objectIds,
                    'AuthURL', clientRequestId, undefined, false
                );
            }
        }

        return objectResponse as ObjectResponse<T>;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        let uri = this.RESOURCE_URI;
        let requestObjectType = 'Profile';

        // set new auth code (positive response is ProfileID as well)
        if (objectType === KIXObjectType.OAUTH2_PROFILE_AUTH) {
            uri = this.buildUri('system', 'oauth2', 'authcode');
            requestObjectType = 'ProfileAuth';
        }

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, requestObjectType, 'ProfileID', true, objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        parameter = this.prepareParameter(parameter);
        const uri = this.buildUri(this.RESOURCE_URI, objectId);

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, 'Profile', 'ProfileID', false, objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    private prepareParameter(parameter: Array<[string, any]>): Array<[string, any]> {
        const secret = this.getParameterValue(parameter, OAuth2ProfileProperty.CLIENT_SECRET);
        if (!secret || secret === '') {
            parameter = parameter.filter((p) => p[0] !== OAuth2ProfileProperty.CLIENT_SECRET);
        }
        return parameter;
    }
}
