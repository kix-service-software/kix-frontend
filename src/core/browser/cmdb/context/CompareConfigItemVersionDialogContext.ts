import { Version, DataType, ConfigItem, KIXObjectType } from "../../../model";
import { Context } from "../../../model/components/context/Context";
import { TableConfiguration, IColumnConfiguration, DefaultColumnConfiguration } from "../../table";
import { ContextService } from "../../context";
import { ConfigItemDetailsContext } from "./ConfigItemDetailsContext";

export class CompareConfigItemVersionDialogContext extends Context {

    public static CONTEXT_ID: string = 'compare-config-item-version-dialog-context';

    public async setObjectList(versions: Version[]) {
        super.setObjectList(versions);

        const widget = this.getWidget('compare-ci-version-widget');
        if (widget) {
            widget.configuration.settings.tableConfiguration = new TableConfiguration();
            const columns: IColumnConfiguration[] = [
                new DefaultColumnConfiguration(
                    'CONFIG_ITEM_ATTRIBUTE', true, false, true, false, 250, false, false, false, DataType.STRING, true,
                    'multiline-cell'
                )
            ];

            const context = await ContextService.getInstance().getContext<ConfigItemDetailsContext>(
                ConfigItemDetailsContext.CONTEXT_ID
            );
            const configItem = await context.getObject<ConfigItem>(KIXObjectType.CONFIG_ITEM);

            versions.forEach((v) => {
                columns.push(
                    new DefaultColumnConfiguration(
                        v.VersionID.toString(), true, false, true, false, 250,
                        false, false, false, DataType.STRING, true, 'multiline-cell',
                        `Version ${this.getVersionNumber(v.VersionID, [...configItem.Versions])}`
                    )
                );
            });
            widget.configuration.settings.tableConfiguration.tableColumns = columns;
        }
    }

    private getVersionNumber(versionId: number, versions: Version[]): number {
        const index = versions
            .sort((a, b) => a.VersionID - b.VersionID)
            .findIndex((v) => v.VersionID === versionId);
        return index + 1;
    }
}
