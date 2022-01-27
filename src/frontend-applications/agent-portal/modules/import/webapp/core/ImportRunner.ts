/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ImportPropertyOperator } from '.';
import { Error } from '../../../../../../server/model/Error';
import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';
import { DefaultColumnConfiguration } from '../../../../model/configuration/DefaultColumnConfiguration';
import { TableConfiguration } from '../../../../model/configuration/TableConfiguration';
import { DataType } from '../../../../model/DataType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ValidService } from '../../../valid/webapp/core';
import { ImportConfig } from '../../model/ImportConfig';

export abstract class ImportRunner {

    public abstract objectType: KIXObjectType | string;

    private csvProperties: string[] = [];
    private csvObjects: any[] = [];

    private errors: string[] = [];

    public async loadObjectsFromCSV(
        csvFile: File, characterSet: string, valueSeparator: string[], textSeparator: string
    ): Promise<void> {
        this.errors = [];
        this.csvObjects = [];
        this.csvProperties = [];

        const encoding = ImportConfig.getCharacterSet().find((v) => v.key === characterSet)?.value;
        const importString = await BrowserUtil.readFileAsText(csvFile, encoding);

        if (!importString.length) {
            BrowserUtil.openErrorOverlay('Translatable#Can not use file (file is empty).');
        } else {
            await this.parseCSVData(importString, valueSeparator, textSeparator);
        }

        this.csvObjects = await this.prepareObjects();
    }

    private async parseCSVData(
        importString: string, valueseparatorKey: string[], textSeparatorKey: string
    ): Promise<void> {
        const textSeparator = ImportConfig.getTextSeparator().find((v) => v.key === textSeparatorKey);
        const textSeparatorString = textSeparator && textSeparator.value ? textSeparator.value : '\'';
        const valueseparators = ImportConfig.getValueSeparator().filter(
            (v) => valueseparatorKey.some((vsk) => vsk === v.key)
        );
        const valueseparatorString = valueseparators && !!valueseparators.length
            ? `[${valueseparators.map((vs) => vs.value).join('')}]` : ';';

        const csvData = BrowserUtil.parseCSV(importString, textSeparatorString, valueseparatorString);
        await this.readCSVData(csvData);
    }

    private async readCSVData(lines: Array<string[]>): Promise<void> {
        this.csvObjects = [];
        this.csvProperties = [];

        this.csvProperties = lines.length > 0 ? lines.shift() : [];

        const lineErrors: number[] = [];
        lines.forEach((row, rowIndex) => {
            const object = {};
            if (row.length < this.csvProperties.length) {
                lineErrors.push(rowIndex + 2);
            }
            this.csvProperties.forEach((p, index) => {
                if (!this.getIgnoreProperties().some((ip) => ip === p)) {
                    object[p] = row[index] || '';
                }
            });
            object['CSV_LINE'] = rowIndex + 1;
            this.csvObjects.push(object);
        });

        if (lineErrors.length) {
            const rowLabel = await TranslationService.translate('Translatable#Row');
            this.errors.push(...lineErrors.map((i) => `Rows with too less values ${rowLabel} ${i}.`));
        }

        await this.checkRequiredProperties();
    }

    private async checkRequiredProperties(): Promise<void> {
        const requiredProperties = await this.getRequiredProperties();
        const csvProperties = this.getCSVColumns();
        const missingProperties: string[] = [];

        requiredProperties?.forEach((property) => {
            const alternative = this.getAlternativeProperty(property);
            let missing = false;
            if (!csvProperties.some((a) => property === a || alternative === a)) {
                missing = true;
            }

            if (missing) {
                missingProperties.push(`${property}${alternative && alternative !== property ? ' / ' + alternative : ''}`);
            }
        });

        if (missingProperties.length) {
            this.errors.push('Translatable#Can not use file (missing required properties):', ...missingProperties);
        }
    }

    private async prepareObjects(): Promise<KIXObject[]> {
        let objects: KIXObject[] = [];
        if (Array.isArray(this.csvObjects)) {
            const objectPromises = this.csvObjects.map((o) => this.getObject(o));
            objects = await Promise.all(objectPromises);
        }

        objects = objects.filter((o) => o !== null && typeof o !== 'undefined');
        return objects;
    }

    public async getObject(object: any): Promise<KIXObject> {
        await this.fixValidValue(object);

        const specificObject = await this.getSpecificObject(object);
        if (specificObject) {
            specificObject[KIXObjectProperty.VALID_ID] = Number(specificObject[KIXObjectProperty.VALID_ID]);

            specificObject['CSV_LINE'] = object['CSV_LINE'];
            specificObject.equals = (o: KIXObject): boolean => {
                return o && o['CSV_LINE'] === specificObject['CSV_LINE'];
            };
        }
        return specificObject;
    }

    private async fixValidValue(object: any): Promise<void> {
        if (!object[KIXObjectProperty.VALID_ID] && object[KIXObjectProperty.VALIDITY]) {
            const validObject = await ValidService.getValidObjectbyName(object[KIXObjectProperty.VALIDITY])
                .catch(() => null);

            if (validObject) {
                object[KIXObjectProperty.VALID_ID] = validObject.ID;
            }
        }
    }

    protected getSpecificObject(object: any): Promise<KIXObject> {
        return object;
    }

    public getIgnoreProperties(): string[] {
        return [
            KIXObjectProperty.CHANGE_BY,
            KIXObjectProperty.CHANGE_TIME,
            KIXObjectProperty.CREATE_BY,
            KIXObjectProperty.CREATE_TIME
        ];
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

    public async getProperties(): Promise<string[]> {
        return [];
    }

    public async getRequiredProperties(): Promise<string[]> {
        return [];
    }

    public getCSVColumns(): string[] {
        return this.csvProperties;
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

    public async execute(
        object: KIXObject, values: ObjectPropertyValue[] = []
    ): Promise<void> {
        await this.checkObject(object).then(async () => {
            const existingObject = await this.getExisting(object);
            this.applyValues(object, values);
            const parameter: Array<[string, any]> = await this.prepareParameter(object);

            if (existingObject) {
                await KIXObjectService.updateObject(this.objectType, parameter, existingObject.ObjectId, false);
            } else {
                await KIXObjectService.createObject(this.objectType, parameter, null, false);
            }
        });
    }

    protected applyValues(object: KIXObject, values: ObjectPropertyValue[]): void {
        values?.forEach((v) => {
            const value = Array.isArray(v.value) ? v.value[0] : v.value;
            switch (v.operator) {
                case ImportPropertyOperator.REPLACE_EMPTY:
                    if (
                        typeof object[v.property] === 'undefined'
                        || object[v.property] === null
                        || object[v.property] === ''
                    ) {
                        object[v.property] = value;
                    }
                    break;
                case ImportPropertyOperator.FORCE:
                    object[v.property] = value;
                    break;
                case ImportPropertyOperator.IGNORE:
                    delete object[v.property];
                    break;
                default:
            }
        });
    }

    protected async prepareParameter(object: KIXObject): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        for (const prop in object) {
            if (object[prop]) {
                parameter.push([prop, object[prop]]);
            }
        }
        return parameter;
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

    public getErrors(): string[] {
        return this.errors;
    }

    public getCSVObjects(): KIXObject[] {
        return this.csvObjects;
    }

    public async getTableConfiguration(): Promise<TableConfiguration> {
        const tableConfiguration = new TableConfiguration(
            'import-table', 'import-table', ConfigurationType.Table, this.objectType
        );

        const columns = [
            new DefaultColumnConfiguration(null, null, null,
                'CSV_LINE', true, false, true, false, 150, true, true, false, DataType.NUMBER, false,
                null, 'Translatable#Row Number'
            )
        ];

        columns.push(...this.csvProperties?.map(
            (p) => TableFactoryService.getInstance().getDefaultColumnConfiguration(this.objectType, p)
        ));

        tableConfiguration.tableColumns = columns;
        tableConfiguration.enableSelection = true;
        tableConfiguration.displayLimit = 7;

        return tableConfiguration;
    }

}