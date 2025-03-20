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
import { ObjectTag } from '../model/ObjectTag';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { Error } from '../../../../../server/model/Error';
import { KIXObjectSpecificDeleteOptions } from '../../../model/KIXObjectSpecificDeleteOptions';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { SearchOperator } from '../../search/model/SearchOperator';
import { ObjectTagLink } from '../model/ObjectTagLink';
import { ObjectTagLinkProperty } from '../model/ObjectTagLinkProperty';
import { SysConfigService } from '../../sysconfig/server/SysConfigService';

export class ObjectTagAPIService extends KIXObjectAPIService {

    private static INSTANCE: ObjectTagAPIService;

    public static getInstance(): ObjectTagAPIService {
        if (!ObjectTagAPIService.INSTANCE) {
            ObjectTagAPIService.INSTANCE = new ObjectTagAPIService();
        }
        return ObjectTagAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('objecttags');

    public objectType: KIXObjectType | string = KIXObjectType.OBJECT_TAG;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.OBJECT_TAG
            || kixObjectType === KIXObjectType.OBJECT_TAG_LINK;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse;
        if (objectType === KIXObjectType.OBJECT_TAG) {
            objectResponse = new ObjectResponse<ObjectTag>();
            const uri = this.buildUri(this.RESOURCE_URI);
            objectResponse = await super.load<ObjectTag>(
                token, KIXObjectType.OBJECT_TAG, uri, loadingOptions, null, KIXObjectType.OBJECT_TAG,
                clientRequestId, ObjectTag
            ).catch((e): ObjectResponse<ObjectTag> => {
                return new ObjectResponse();
            });

            if (objectIds && objectIds.length) {
                objectResponse.objects = objectResponse?.objects?.filter(
                    (t: ObjectTag) => objectIds.some((oid) => oid === t.Name)
                );
            }
        }
        else if (objectType === KIXObjectType.OBJECT_TAG_LINK) {

            const uri = this.buildUri(this.RESOURCE_URI,'taglinks');
            objectResponse = new ObjectResponse<ObjectTagLink>();
            objectResponse = await super.load<ObjectTagLink>(
                token, KIXObjectType.OBJECT_TAG_LINK, uri, loadingOptions, null, KIXObjectType.OBJECT_TAG_LINK,
                clientRequestId, ObjectTagLink
            ).catch((e): ObjectResponse<ObjectTagLink> => {
                return new ObjectResponse();
            });

            if (objectIds && objectIds.length) {
                objectResponse.objects = objectResponse?.objects?.filter(
                    (t: ObjectTagLink) => objectIds.some((oid) => Number(oid) === Number(t.ID))
                );
            }
        }

        objectResponse.totalCount = objectResponse.objects?.length;
        return objectResponse as any;
    }

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return [];
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const types = await this.prepareObjectTagTypes(token);

        const objectID = parameter.find((p) => p[0] === ObjectTagLinkProperty.OBJECT_ID);
        const type = parameter.find((p) => p[0] === ObjectTagLinkProperty.OBJECT_TYPE);

        const prepared = await this.prepareSysConfig(token, clientRequestId, type[1], objectID[1]);

        type[1] = prepared?.has('ObjectType') ? prepared.get('ObjectType').toString() : type[1];
        objectID[1] = prepared?.has('ObjectID') ? prepared.get('ObjectID') : objectID[1];

        type[1] = types.has(type[1])
            ? types.get(type[1])
            : type[1];

        const uri = this.buildUri(this.RESOURCE_URI);
        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, objectType, 'ObjectTagID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return id;
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectId: number | string,
        deleteOptions: KIXObjectSpecificDeleteOptions, cacheKeyPrefix: string, ressourceUri: string = this.RESOURCE_URI
    ): Promise<Error[]> {
        const types = await this.prepareObjectTagTypes(token);

        const prepared = await this.prepareSysConfig(token, clientRequestId, objectType, objectId);

        objectType = prepared?.has('ObjectType') ? prepared.get('ObjectType').toString() : objectType;
        objectId = prepared?.has('ObjectID') ? prepared.get('ObjectID') : objectId;

        objectType = types.has(objectType)
            ? types.get(objectType)
            : objectType;

        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.filter = [
            new FilterCriteria(
                ObjectTagLinkProperty.OBJECT_TYPE, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, objectType
            ),
            new FilterCriteria(
                ObjectTagLinkProperty.OBJECT_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, objectId.toString()
            )
        ];

        const objectResponse = await this.loadObjects<ObjectTagLink>(
            token, clientRequestId, KIXObjectType.OBJECT_TAG_LINK, null, loadingOptions
        );

        if (objectResponse?.objects?.length) {
            for (const tag of objectResponse.objects) {
                const uri = [this.buildUri(this.RESOURCE_URI,tag.ID)];
                const errors = await this.sendDeleteRequest<void>(token, clientRequestId, uri, cacheKeyPrefix)
                    .catch((error: Error) => {
                        LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                        throw new Error(error.Code, error.Message);
                    });

                if (errors && errors.length) {
                    LoggingService.getInstance().error(`${errors[0].Code}: ${errors[0].Message}`, errors[0]);
                    throw new Error(errors[0].Code, errors[0].Message);
                }
            }
        }

        return [];
    }

    private async prepareObjectTagTypes(token:string): Promise<Map<string,string>> {
        const config = await SysConfigService.getInstance().getSysConfigOptionValue(
            token,'ObjectTag::ObjectTypes'
        );
        if (config) {
            const types: Map<string, string> = new Map();
            Object.keys(config).forEach((entry: string) => {
                types.set(entry, config[entry]);

            });
            return new Map([...types.entries()].sort());
        }
        return new Map();
    }

    private async prepareSysConfig(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectId: number | string
    ): Promise<Map<string, string | number>> {
        let result: Map<string, string | number> = new Map();
        if (
            objectType !== KIXObjectType.SYS_CONFIG_OPTION
            && objectType !== KIXObjectType.SYS_CONFIG_OPTION_DEFINITION
        ) {
            return null;
        }

        if (objectType === KIXObjectType.SYS_CONFIG_OPTION) {
            result.set('ObjectType', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION);
        }

        const optionService = KIXObjectServiceRegistry.getServiceInstance(
            KIXObjectType.SYS_CONFIG_OPTION
        );
        const configs = await optionService.loadObjects(
            token, clientRequestId, KIXObjectType.SYS_CONFIG_OPTION, [objectId],
            null, null
        );
        if (configs?.objects) {
            const id = configs.objects.filter((c) => c.Name === objectId).map((c) => c.ID);
            result.set('ObjectID', id[0]);
        }

        return result;
    }
}
