import { ContextService } from '../context';
import { IKIXObjectFactory } from '../kix';
import { ConfigItem, ConfigItemFactory, Version, Link, ConfigItemImage, ConfigItemHistory } from '../../model';

export class ConfigItemBrowserFactory implements IKIXObjectFactory<ConfigItem> {

    private static INSTANCE: ConfigItemBrowserFactory;

    public static getInstance(): ConfigItemBrowserFactory {
        if (!ConfigItemBrowserFactory.INSTANCE) {
            ConfigItemBrowserFactory.INSTANCE = new ConfigItemBrowserFactory();
        }
        return ConfigItemBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(configItem: ConfigItem): Promise<ConfigItem> {
        const newConfigItem = ConfigItemFactory.create(configItem);
        this.mapAdditionalData(newConfigItem);
        return newConfigItem;
    }

    private mapAdditionalData(configItem: ConfigItem): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            configItem.createdBy = objectData.users.find((u) => u.UserID === configItem.CreateBy);
            configItem.changedBy = objectData.users.find((u) => u.UserID === configItem.CreateBy);
        }

        configItem.CurrentVersion = new Version(configItem.CurrentVersion);

        if (!configItem.Name && configItem.CurrentVersion) {
            configItem.Name = configItem.CurrentVersion.Name;
        }

        if (configItem.Links) {
            configItem.Links = configItem.Links.map((l) => new Link(l));
        }

        if (configItem.Versions) {
            configItem.Versions = configItem.Versions.map((v) => new Version(v));
        }

        if (configItem.Images) {
            configItem.Images = configItem.Images.map((i) => new ConfigItemImage(i));
        }

        if (configItem.History) {
            configItem.History = configItem.History.map((h) => new ConfigItemHistory(h));
        }

    }
}
