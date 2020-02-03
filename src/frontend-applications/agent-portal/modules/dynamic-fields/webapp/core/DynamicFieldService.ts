/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { DynamicField } from "../../model/DynamicField";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { KIXObjectSpecificLoadingOptions } from "../../../../model/KIXObjectSpecificLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { DynamicFieldProperty } from "../../model/DynamicFieldProperty";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";

export class DynamicFieldService extends KIXObjectService<DynamicField> {

    private schema: Map<string, any> = new Map();

    private static INSTANCE: DynamicFieldService = null;

    public static getInstance(): DynamicFieldService {
        if (!DynamicFieldService.INSTANCE) {
            DynamicFieldService.INSTANCE = new DynamicFieldService();
        }

        return DynamicFieldService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.DYNAMIC_FIELD;
    }

    public getLinkObjectName(): string {
        return 'DynamicField';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        if (objectType === KIXObjectType.DYNAMIC_FIELD) {
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        return objects;
    }

    public registerConfigSchema(id: string, schema: any): void {
        this.schema.set(id, schema);
    }

    public getConfigSchema(id: string): any {
        return this.schema.get(id);
    }

    public static async loadDynamicField(name: string): Promise<DynamicField> {
        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null,
            new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        DynamicFieldProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                        FilterType.AND, name
                    )
                ], null, 1, [DynamicFieldProperty.CONFIG]
            ), null, true
        ).catch(() => [] as DynamicField[]);

        return dynamicFields && dynamicFields.length ? dynamicFields[0] : null;
    }

    public static getDynamicFieldName(property: string): string {
        let name: string;
        if (property.match(/^DynamicFields?\..+/)) {
            name = property.replace(/^DynamicFields?\.(.+)/, '$1');
        }
        return name;
    }

}
