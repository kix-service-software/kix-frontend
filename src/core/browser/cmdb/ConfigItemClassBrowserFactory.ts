import { KIXObjectFactory } from '../kix';
import { ConfigItemClass, ConfigItemClassFactory } from '../../model';

export class ConfigItemClassBrowserFactory extends KIXObjectFactory<ConfigItemClass> {

    private static INSTANCE: ConfigItemClassBrowserFactory;

    public static getInstance(): ConfigItemClassBrowserFactory {
        if (!ConfigItemClassBrowserFactory.INSTANCE) {
            ConfigItemClassBrowserFactory.INSTANCE = new ConfigItemClassBrowserFactory();
        }
        return ConfigItemClassBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(configItemClass: ConfigItemClass): Promise<ConfigItemClass> {
        const newConfigItemClass = ConfigItemClassFactory.create(configItemClass);
        super.createPermissions(newConfigItemClass);
        return newConfigItemClass;
    }

}
