import { IKIXObjectFactory, KIXObjectService } from '../kix';
import {
    ConfigItem, ConfigItemFactory, Version, Link, ConfigItemImage,
    ConfigItemHistory, User, KIXObjectType
} from '../../model';

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
        await this.mapAdditionalData(newConfigItem);
        return newConfigItem;
    }

    private async mapAdditionalData(configItem: ConfigItem): Promise<void> {
        const createUsers = await KIXObjectService.loadObjects<User>(
            KIXObjectType.USER, [configItem.CreateBy], null, null, true
        ).catch((error) => [] as User[]);
        configItem.createdBy = createUsers && !!createUsers.length ? createUsers[0] : null;
        const changeUsers = await KIXObjectService.loadObjects<User>(
            KIXObjectType.USER, [configItem.ChangeBy], null, null, true
        ).catch((error) => [] as User[]);
        configItem.changedBy = changeUsers && !!changeUsers.length ? changeUsers[0] : null;

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
