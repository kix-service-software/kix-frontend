import { IKIXObjectFactory } from '../kix';
import { ConfigItemClass, ConfigItemClassFactory } from '../../model';

export class ConfigItemClassBrowserFactory implements IKIXObjectFactory<ConfigItemClass> {

    private static INSTANCE: ConfigItemClassBrowserFactory;

    public static getInstance(): ConfigItemClassBrowserFactory {
        if (!ConfigItemClassBrowserFactory.INSTANCE) {
            ConfigItemClassBrowserFactory.INSTANCE = new ConfigItemClassBrowserFactory();
        }
        return ConfigItemClassBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(configItemClass: ConfigItemClass): Promise<ConfigItemClass> {
        const newConfigItemClass = ConfigItemClassFactory.create(configItemClass);
        return newConfigItemClass;
    }

}
