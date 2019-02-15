import {
    WidgetConfiguration, WidgetType, ConfiguredWidget, Version, DataType, ConfigItem, KIXObjectType
} from "../../../model";
import { Context } from "../../../model/components/context/Context";
import {
    CompareConfigItemVersionDialogContextConfiguration
} from "./CompareConfigItemVersionDialogContextConfiguration";
import { TableConfiguration, IColumnConfiguration, DefaultColumnConfiguration } from "../../table";
import { ContextService } from "../../context";
import { ConfigItemDetailsContext } from "./ConfigItemDetailsContext";

export class CompareConfigItemVersionDialogContext extends Context<CompareConfigItemVersionDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'compare-config-item-version-dialog-context';

    public getCompareWidget(): ConfiguredWidget {
        return this.configuration.compareWidget;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return this.configuration.compareWidget.configuration;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

    public async setObjectList(versions: Version[]) {
        super.setObjectList(versions);

        if (this.configuration.compareWidget) {
            this.configuration.compareWidget.configuration.settings.tableConfiguration = new TableConfiguration();
            const columns: IColumnConfiguration[] = [
                new DefaultColumnConfiguration(
                    'CONFIG_ITEM_ATTRIBUTE', true, false, true, false, 250, false, false, false, DataType.STRING, true
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
                        false, false, false, DataType.STRING, true, null,
                        `Version ${this.getVersionNumber(v.VersionID, [...configItem.Versions])}`
                    )
                );
            });
            this.configuration.compareWidget.configuration.settings.tableConfiguration.tableColumns = columns;
        }
    }

    private getVersionNumber(versionId: number, versions: Version[]): number {
        const index = versions
            .sort((a, b) => a.VersionID - b.VersionID)
            .findIndex((v) => v.VersionID === versionId);
        return index + 1;
    }
}
