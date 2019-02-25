import { IRowObject, RowObject, ITable, TableValue, ValueState } from "../../../table";
import {
    KIXObjectType, KIXObjectLoadingOptions, Version, AttributeDefinition
} from "../../../../model";
import { ContextService } from "../../../context";
import { TableContentProvider } from "../../../table/TableContentProvider";
import { PreparedData } from "../../../../model/kix/cmdb/PreparedData";

export class CompareConfigItemVersionTableContentProvider extends TableContentProvider<Version> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM_VERSION_COMPARE, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<Version>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const versionList = await context.getObjectList();
            const versions = versionList as Version[];
            if (versions) {
                const rows = await this.buildRowObjects(versions);
                rowObjects = rows;
            }
        }

        return rowObjects;
    }

    private async buildRowObjects(versions: Version[]): Promise<RowObject[]> {
        let rows: RowObject[] = [];

        versions = versions.sort((a, b) => a.VersionID - b.VersionID);

        let attributes;
        if (versions.length > 0) {
            attributes = versions[0].Definition.Definition.map((d) => new AttributeDefinition(d));
            for (let i = 1; i < versions.length; i++) {
                const definition = versions[i].Definition;
                if (definition && definition.Definition) {
                    this.compareTrees(attributes, definition.Definition);
                }
            }
        }

        if (attributes) {
            rows = this.createRows(versions, attributes, null, []);
        }

        return rows;
    }

    private createRows(
        versions: Version[], attributes: AttributeDefinition[],
        parentRow: RowObject, parentKeys: Array<[string, number]>
    ): RowObject[] {
        const rows = [];
        attributes.forEach((a, index) => {

            let maxCount = 0;
            const versionValues: Array<[number, TableValue[]]> = [];
            versions.forEach((v) => {
                const values = this.getPreparedDataDisplayValues(v, v.PreparedData, [...parentKeys], a.Key);
                versionValues.push([v.VersionID, values]);
                maxCount = values.length > maxCount ? values.length : maxCount;
            });

            for (let i = 0; i < maxCount; i++) {
                const rowObject = new RowObject([new TableValue('CONFIG_ITEM_ATTRIBUTE', a.Key, a.Name)]);
                if (parentRow) {
                    parentRow.addChild(rowObject);
                } else {
                    rows.push(rowObject);
                }

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
                    this.createRows(versions, a.Sub, rowObject, [...parentKeys, [a.Key, i]]);
                }
            }
        });
        return rows;
    }

    private getPreparedDataDisplayValues(
        version: Version, data: PreparedData[], parentKeys: Array<[string, number]>, key: string
    ): TableValue[] {
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
                        ...this.getPreparedDataDisplayValues(
                            version, rootData[0].Sub, parentKeys.slice(1, parentKeys.length), key
                        )
                    ];
                } else {
                    rootData.forEach(
                        (rd) => values.push(new TableValue(
                            version.VersionID.toString(), rd.DisplayValue, rd.DisplayValue
                        ))
                    );
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

                const currentNames = a1.Name.split(' / ');
                if (!currentNames.some((n) => n === a2.Name)) {
                    currentNames.push(a2.Name);
                    a1.Name = currentNames.join(' / ');
                }

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
