import { IRowObject, RowObject, ITable, TableValue, ValueState } from "../../../table";
import {
    KIXObjectType, KIXObjectLoadingOptions, Version, AttributeDefinition
} from "../../../../model";
import { ContextService } from "../../../context";
import { TableContentProvider } from "../../../table/TableContentProvider";
import { ConfigItemClassAttributeUtil } from "../../ConfigItemClassAttributeUtil";
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
                ConfigItemClassAttributeUtil.getInstance().getAttributeDefinitions();
                const rows = await this.createRows(versions);
                rowObjects = rows;
            }
        }

        return rowObjects;
    }

    private async createRows(versions: Version[]): Promise<RowObject[]> {
        const rows: RowObject[] = [];

        const keyNames: Array<[string, string[]]> = [];

        versions = versions.sort((a, b) => a.VersionID - b.VersionID);
        for (const version of versions) {
            version.Definition.Definition.forEach((definition) => {
                let row = rows.find((r) => this.rowHasValue(r, definition.Key));
                if (!row) {
                    row = new RowObject([new TableValue('CONFIG_ITEM_ATTRIBUTE', definition.Key)]);

                    versions.forEach(
                        (v) => row.addValue(
                            new TableValue(v.VersionID.toString(), this.getVersionValue(definition.Key, v))
                        )
                    );
                    rows.push(row);
                }
                this.addKeyName(definition.Key, definition.Name, keyNames);
                this.createRow(definition, row, versions, keyNames);
            });
        }

        this.setKeyNames(rows, keyNames);

        return rows;
    }

    private createRow(
        definition: AttributeDefinition, parentRow: RowObject, versions: Version[], keyNames: Array<[string, string[]]>
    ): void {
        if (definition.Sub) {
            for (const subDefinition of definition.Sub) {
                let childRow = parentRow.getChildren().find((c) => this.rowHasValue(c, subDefinition.Key));
                if (!childRow) {
                    childRow = new RowObject([new TableValue('CONFIG_ITEM_ATTRIBUTE', subDefinition.Key)]);
                    parentRow.addChild(childRow);

                    let firstValue = true;
                    let oldValue: string;
                    versions.forEach((v) => {

                        const versionValue = this.getVersionValue(subDefinition.Key, v);

                        const state = firstValue
                            ? (versionValue === undefined ? ValueState.NOT_EXISTING : ValueState.NONE)
                            : this.getValueState(oldValue, versionValue);
                        firstValue = false;

                        const value = new TableValue(v.VersionID.toString(), versionValue, null, state);
                        childRow.addValue(value);
                        oldValue = versionValue;
                    });
                }
                this.addKeyName(subDefinition.Key, subDefinition.Name, keyNames);
                this.createRow(subDefinition, childRow, versions, keyNames);
            }
        }
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

    private rowHasValue(row: RowObject, value: string): boolean {
        return row.getValues().some((v) => v.property === 'CONFIG_ITEM_ATTRIBUTE' && v.objectValue === value);
    }

    private getVersionValue(key: string, version: Version): string {
        if (!this.hasAttributeInDefinition(key, version.Definition.Definition)) {
            return undefined;
        }

        for (const definition of version.PreparedData) {
            const value = this.getValue(key, definition);
            if (value) {
                return value;
            }
        }
        return null;
    }

    private getValue(key: string, data: PreparedData): string {
        if (data.Key === key) {
            return data.DisplayValue;
        }

        if (data.Sub) {
            for (const subData of data.Sub) {
                const value = this.getValue(key, subData);
                if (value) {
                    return value;
                }
            }
            return null;
        }
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

    private addKeyName(key: string, name: string, keyNames: Array<[string, string[]]>): void {
        const index = keyNames.findIndex((kn) => kn[0] === key);
        if (index !== -1) {
            if (!keyNames[index][1].some((n) => n === name)) {
                keyNames[index][1].push(name);
            }
        } else {
            keyNames.push([key, [name]]);
        }
    }

    private setKeyNames(rows: RowObject[], keyNames: Array<[string, string[]]>): void {
        if (rows) {
            rows.forEach((r) => {
                const attributeValue = r.getValues().find((v) => v.property === 'CONFIG_ITEM_ATTRIBUTE');
                const keyName = keyNames.find((kn) => kn[0] === attributeValue.objectValue);
                if (keyName) {
                    attributeValue.displayValue = keyName[1].join(' / ');
                }

                this.setKeyNames(r.getChildren(), keyNames);
            });
        }
    }

}
