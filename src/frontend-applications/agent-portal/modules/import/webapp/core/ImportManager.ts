/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from '../../../base-components/webapp/core/dynamic-form/AbstractDynamicFormManager';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { ValidObject } from '../../../valid/model/ValidObject';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ImportPropertyOperator } from './ImportPropertyOperator';
import { ImportPropertyOperatorUtil } from './ImportPropertyOperatorUtil';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { Column } from '../../../base-components/webapp/core/table';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { Error } from '../../../../../../server/model/Error';

export abstract class ImportManager extends AbstractDynamicFormManager {

    public objects: KIXObject[] = [];

    protected importRun: boolean = false;

    protected abstract getSpecificObject(object: any): Promise<KIXObject>;

    public init(): void {
        super.init();
        this.importRun = false;
    }

    public async getObject(object: any): Promise<KIXObject> {
        if (!object[KIXObjectProperty.VALID_ID] && object[KIXObjectProperty.VALIDITY]) {
            const validObject = await this.getValidObjectbyName(object[KIXObjectProperty.VALIDITY]);
            if (validObject) {
                object[KIXObjectProperty.VALID_ID] = validObject.ID;
            }
        }

        const specificObject = await this.getSpecificObject(object);
        if (!isNaN(Number(specificObject[KIXObjectProperty.VALID_ID]))) {
            specificObject[KIXObjectProperty.VALID_ID] = Number(specificObject[KIXObjectProperty.VALID_ID]);
        }

        specificObject['CSV_LINE'] = object['CSV_LINE'];
        specificObject.equals = (tableObject: KIXObject): boolean => {
            return tableObject && tableObject['CSV_LINE'] === specificObject['CSV_LINE'];
        };
        return specificObject;
    }

    private async getValidObjectbyName(name: string): Promise<ValidObject> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    'Name', SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, name
                )
            ]
        );
        const validObjects = await KIXObjectService.loadObjects<ValidObject>(
            KIXObjectType.VALID_OBJECT, null, loadingOptions, null, true
        ).catch((error) => [] as ValidObject[]);
        return validObjects && !!validObjects.length ? validObjects[0] : null;
    }

    public getImportRunState(): boolean {
        return this.importRun;
    }

    public async getRequiredProperties(): Promise<string[]> {
        return [];
    }

    public getAlternativeProperty(property: string): string {
        if (property === KIXObjectProperty.VALID_ID) {
            return KIXObjectProperty.VALIDITY;
        }
        return;
    }

    public getIDProperty(): string {
        return 'ID';
    }

    public async getKnownProperties(): Promise<string[]> {
        const columnProperties = await this.getColumnProperties();
        const alternativeProperties = [];
        columnProperties.forEach((p) => {
            const alternative = this.getAlternativeProperty(p);
            if (alternative) {
                alternativeProperties.push(alternative);
            }
        });
        return [
            this.getIDProperty(),
            ...columnProperties,
            ...alternativeProperties
        ];
    }

    public async getColumnProperties(): Promise<string[]> {
        const requiredProperties = await this.getRequiredProperties();
        const generalProperties = (await this.getProperties()).map((p) => p[0])
            .filter((p) => !requiredProperties.some((rp) => rp === p));
        return [
            ...requiredProperties,
            ...generalProperties
        ];
    }

    public async getOperations(property: string): Promise<ImportPropertyOperator[]> {
        return [
            ImportPropertyOperator.REPLACE_EMPTY,
            ImportPropertyOperator.FORCE,
            ImportPropertyOperator.IGNORE
        ];
    }

    public getOperatorDisplayText(operator: ImportPropertyOperator): Promise<string> {
        return ImportPropertyOperatorUtil.getText(operator);
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        return InputFieldTypes.TEXT;
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return value.property && value.operator && value.operator !== ImportPropertyOperator.IGNORE;
    }

    public async getEditableValues(): Promise<ObjectPropertyValue[]> {
        return [...this.values.filter(
            (bv) => bv.operator === ImportPropertyOperator.IGNORE
                || bv.property !== null
        )];
    }

    public async execute(object: KIXObject, columns: Column[]): Promise<void> {
        this.importRun = true;

        await this.checkObject(object).then(async () => {
            const existingObject = await this.getExisting(object);
            const parameter: Array<[string, any]> = await this.prepareParameter(object, columns);

            if (existingObject) {
                await KIXObjectService.updateObject(this.objectType, parameter, existingObject.ObjectId, false);
            } else {
                await KIXObjectService.createObject(this.objectType, parameter, null, false);
            }
        });
    }

    protected async checkObject(object: KIXObject): Promise<void> {
        const requiredProperties = await this.getRequiredProperties();
        for (const rp of requiredProperties) {
            if (typeof object[rp] === 'undefined' || object[rp] === null || object[rp] === '') {
                throw new Error(null, `Missing value for ${rp}`);
            }
        }
        return;
    }

    protected async getExisting(object: KIXObject): Promise<KIXObject> {
        if (object.ObjectId) {
            const existingObjects = await KIXObjectService.loadObjects(
                this.objectType, [object.ObjectId], null, null, true
            );
            return existingObjects && !!existingObjects.length ? existingObjects[0] : null;
        }
        return null;
    }

    protected async prepareParameter(object: KIXObject, columns: Column[]): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        const objectProperties = await this.getColumnProperties();
        for (const prop in object) {
            if (
                prop && objectProperties.some((kp) => kp === prop)
                && columns.some((c) => c.getColumnId() === prop)
            ) {
                parameter.push([prop, object[prop]]);
            }
        }
        return parameter;
    }

    public async getIdentifierText(object: KIXObject): Promise<string> {
        return await LabelService.getInstance().getObjectText(object);
    }
}
