/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../base-components/webapp/core/table/TableContentProvider';
import { Version } from '../../../../model/Version';
import { Table, RowObject, TableValue, ValueState } from '../../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { AttributeDefinition } from '../../../../model/AttributeDefinition';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { SortUtil } from '../../../../../../model/SortUtil';
import { PreparedData } from '../../../../model/PreparedData';
import { DateTimeUtil } from '../../../../../../modules/base-components/webapp/core/DateTimeUtil';

export class CompareConfigItemVersionTableContentProvider extends TableContentProvider<Version> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM_VERSION_COMPARE, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<Version>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            const versionList = await context.getObjectList(KIXObjectType.CONFIG_ITEM_VERSION);
            const versions = versionList as Version[];
            if (versions) {
                rowObjects = await this.buildRowObjects(versions);
            }
        }

        return rowObjects;
    }

    private async buildRowObjects(versions: Version[]): Promise<RowObject[]> {
        let rowObjects: RowObject[] = [];
        const checkVersions = [...versions].sort((a, b) => a.VersionID - b.VersionID);

        let attributes;
        if (!!checkVersions.length) {
            attributes = checkVersions[0].Definition.Definition.map((d) => new AttributeDefinition(d));
            for (let i = 1; i < checkVersions.length; i++) {
                const definition = checkVersions[i].Definition;
                if (definition && definition.Definition) {
                    this.compareTrees(attributes, definition.Definition);
                }
            }
        }

        if (attributes) {
            rowObjects = await this.createRows(checkVersions, attributes, []);
        }

        return rowObjects;
    }

    private async createRows(
        versions: Version[], attributes: AttributeDefinition[], parentKeys: Array<[string, number]>
    ): Promise<RowObject[]> {
        const rowObjects = [];
        for (const a of attributes) {
            let maxCount = 0;
            const versionValues: Array<[number, TableValue[]]> = [];
            for (const v of versions) {
                const values = await this.getPreparedDataDisplayValues(v, v.PreparedData, [...parentKeys], a.Key);
                versionValues.push([v.VersionID, values]);
                maxCount = values.length > maxCount ? values.length : maxCount;
            }

            for (let i = 0; i < maxCount; i++) {
                let text: string;
                if (a.Name.match(/_#_/)) {
                    const names = a.Name.split('_#_');
                    const uniqueNames = [];
                    names.forEach((n) => {
                        if (!uniqueNames.some((un) => un === n)) {
                            uniqueNames.push(n);
                        }
                    });
                    const translatedNames: string[] = [];
                    for (const name of uniqueNames) {
                        translatedNames.push(await TranslationService.translate(name));
                    }
                    text = translatedNames.sort(
                        (aName, bName) => SortUtil.compareString(aName, bName)
                    ).join(' / ');
                } else {
                    text = await TranslationService.translate(a.Name);
                }
                const rowObject = new RowObject([new TableValue('CONFIG_ITEM_ATTRIBUTE', a.Key, text)]);
                rowObjects.push(rowObject);

                versionValues.forEach((versionValue, vIndex) => {
                    if (versionValue && versionValue[1][i]) {
                        const value = versionValue[1][i];
                        value.state = ValueState.NONE;
                        if (vIndex > 0) {
                            const currentValue = versionValue[1][i]
                                ? versionValue[1][i].objectValue
                                : undefined;

                            const oldValue = versionValues[vIndex - 1][1][i]
                                ? versionValues[vIndex - 1][1][i].objectValue
                                : undefined;

                            value.state = this.getValueState(oldValue, currentValue);
                        }

                        rowObject.addValue(value);
                    } else {
                        rowObject.addValue(
                            new TableValue(versionValue[0].toString(), null, null, ValueState.NOT_EXISTING)
                        );
                    }
                });

                if (a.Sub) {
                    const subRowObjects = await this.createRows(versions, a.Sub, [...parentKeys, [a.Key, i]]);
                    if (subRowObjects) {
                        subRowObjects.forEach((subRowObject) => {
                            rowObject.addChild(subRowObject);
                        });
                    }
                }
            }
        }
        return rowObjects;
    }

    private async getPreparedDataDisplayValues(
        version: Version, data: PreparedData[], parentKeys: Array<[string, number]>, key: string
    ): Promise<TableValue[]> {
        let values: TableValue[] = [];
        if (data && data.length) {
            let rootData: PreparedData[];
            if (parentKeys && parentKeys.length) {
                const existingData = data.filter((pd) => pd.Key === parentKeys[0][0]);
                const parentIndex = parentKeys[0][1];
                if (existingData[parentIndex]) {
                    rootData = [existingData[parentIndex]];
                }
            } else {
                rootData = data.filter((pd) => pd.Key === key);
            }

            if (rootData && rootData.length) {
                if (parentKeys.length > 0) {
                    values = [
                        ...values,
                        ... await this.getPreparedDataDisplayValues(
                            version, rootData[0].Sub, parentKeys.slice(1, parentKeys.length), key
                        )
                    ];
                } else {
                    for (const rd of rootData) {
                        let displayValue = rd.DisplayValue ? rd.DisplayValue : null;
                        if (displayValue) {
                            if (rd.Type === 'Date') {
                                displayValue = await DateTimeUtil.getLocalDateString(displayValue);
                            } else {
                                displayValue = await TranslationService.translate(displayValue);
                            }
                        } else if (rd.Type === 'Attachment' && rd.Value) {
                            displayValue = `${rd.Value.Filename} (${rd.Value.Filesize})`;
                        }
                        values.push(new TableValue(version.VersionID.toString(), displayValue, displayValue));
                    }
                }
            } else if (this.hasAttributeInDefinition(key, version.Definition.Definition)) {
                values.push(new TableValue(version.VersionID.toString(), null, null));
            }
        }

        return values;
    }

    private hasAttributeInDefinition(key: string, attributeDefinitions: AttributeDefinition[]): boolean {
        for (const definition of attributeDefinitions) {
            if (definition.Key === key) {
                return true;
            }

            if (definition.Sub) {
                const hasKey = this.hasAttributeInDefinition(key, definition.Sub);
                if (hasKey) {
                    return true;
                }
            }
        }

        return false;
    }

    private getValueState(oldValue: string, versionValue: string): ValueState {
        if (versionValue === undefined) {
            return ValueState.NOT_EXISTING;
        }

        if (oldValue === undefined && versionValue === null) {
            return ValueState.NONE;
        }

        if (oldValue === undefined && versionValue) {
            return ValueState.NEW;
        }

        if (oldValue === null && versionValue) {
            return ValueState.NEW;
        }

        if (oldValue && versionValue === null) {
            return ValueState.DELETED;
        }

        if (oldValue !== versionValue) {
            return ValueState.CHANGED;
        }

        return ValueState.NONE;
    }

    private compareTrees(tree1: AttributeDefinition[], tree2: AttributeDefinition[]): void {
        tree2.forEach((a2) => {
            const a1 = tree1.find((a) => a2.Key === a.Key);
            if (a1) {

                a1.Name = a1.Name + '_#_' + a2.Name;

                if (a1.Sub && a2.Sub) {
                    this.compareTrees(a1.Sub, a2.Sub);
                } else if (!a1.Sub && a2.Sub) {
                    a1.Sub = a2.Sub;
                }
            } else {
                tree1.push(a2);
            }
        });
    }

}
