/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, InputFieldTypes } from "../../../model";
import { DynamicFormOperationsType, AbstractDynamicFormManager } from "../../form";
import { ObjectPropertyValue } from "../../ObjectPropertyValue";

export class PermissionManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.PERMISSION_TYPE;

    public uniqueProperties: boolean = false;

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return 'SPECIFIC';
    }

    public getSpecificInput(): string {
        return 'permission-input';
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return true;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        return [
            ["1", "Resource"],
            ["2", "Property Value"]
        ];
    }

    public async getPropertiesPlaceholder(): Promise<string> {
        return 'Translatable#Type';
    }

    public async getOperationsPlaceholder(): Promise<string> {
        return 'Translatable#Target';
    }

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return DynamicFormOperationsType.STRING;
    }

    public async getOperations(property: string): Promise<any[]> {
        return [];
    }
}
