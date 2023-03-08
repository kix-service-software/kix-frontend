/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { Error } from '../../../../../server/model/Error';
import { DynamicField } from '../model/DynamicField';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { DynamicFieldProperty } from '../model/DynamicFieldProperty';
import { SearchOperator } from '../../search/model/SearchOperator';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { DynamicFieldType } from '../model/DynamicFieldType';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';



export class DynamicFieldAPIService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = 'system/dynamicfields';

    protected objectType: KIXObjectType | string = KIXObjectType.DYNAMIC_FIELD;

    private static INSTANCE: DynamicFieldAPIService;

    public static getInstance(): DynamicFieldAPIService {
        if (!DynamicFieldAPIService.INSTANCE) {
            DynamicFieldAPIService.INSTANCE = new DynamicFieldAPIService();
        }
        return DynamicFieldAPIService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(type: KIXObjectType | string): boolean {
        return type === KIXObjectType.DYNAMIC_FIELD
            || type === KIXObjectType.DYNAMIC_FIELD_TYPE;
    }

    public async preloadObjects(token: string): Promise<void> {
        const ticketDFLoadingOptions = new KIXObjectLoadingOptions();
        ticketDFLoadingOptions.filter = [
            new FilterCriteria(
                DynamicFieldProperty.OBJECT_TYPE, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, KIXObjectType.TICKET
            ),
            new FilterCriteria(
                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, 1
            )
        ];

        await this.loadObjects(
            token, 'DynamicFieldAPIServicePreload', KIXObjectType.DYNAMIC_FIELD, null, ticketDFLoadingOptions, null
        );

        const configLoadingOptions = new KIXObjectLoadingOptions();
        configLoadingOptions.includes = [DynamicFieldProperty.CONFIG];
        await this.loadObjects(
            token, 'DynamicFieldAPIServicePreload', KIXObjectType.DYNAMIC_FIELD, null, configLoadingOptions, null
        );
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        if (objectType === KIXObjectType.DYNAMIC_FIELD) {
            objects = await super.load(
                token, objectType, this.RESOURCE_URI, loadingOptions, objectIds, 'DynamicField',
                clientRequestId, DynamicField
            );
        } else if (objectType === KIXObjectType.DYNAMIC_FIELD_TYPE) {
            const uri = this.buildUri(this.RESOURCE_URI, 'types');
            objects = await super.load(
                token, objectType, uri, loadingOptions, null, 'DynamicFieldType',
                clientRequestId, DynamicFieldType
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, this.RESOURCE_URI, this.objectType, 'DynamicFieldID', true
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
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, this.objectType, 'DynamicFieldID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return id;
    }

    public async loadDynamicField(token: string, name: string, id?: number): Promise<DynamicField> {
        let dynamicFields: DynamicField[];
        if (name || id) {
            const filter = id ? null : [
                new FilterCriteria(
                    DynamicFieldProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, name
                )
            ];
            dynamicFields = await this.loadObjects<DynamicField>(
                token, '',
                KIXObjectType.DYNAMIC_FIELD, id ? [id] : null,
                new KIXObjectLoadingOptions(filter, null, null, [DynamicFieldProperty.CONFIG]), null
            ).catch(() => [] as DynamicField[]);
        }
        return dynamicFields && dynamicFields.length ? dynamicFields[0] : null;
    }

}
