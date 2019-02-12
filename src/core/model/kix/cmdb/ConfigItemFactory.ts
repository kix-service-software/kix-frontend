import { ConfigItem } from "./ConfigItem";

export class ConfigItemFactory {

    public static create(_configItem: ConfigItem): ConfigItem {
        const configItem = new ConfigItem(_configItem);
        return configItem;
    }

}
