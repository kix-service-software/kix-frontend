import { IKIXObjectFactory } from '../kix';
import { ConfigItemImage, ConfigItemImageFactory } from '../../model';
import { config } from 'winston';

export class ConfigItemImageBrowserFactory implements IKIXObjectFactory<ConfigItemImage> {

    private static INSTANCE: ConfigItemImageBrowserFactory;

    public static getInstance(): ConfigItemImageBrowserFactory {
        if (!ConfigItemImageBrowserFactory.INSTANCE) {
            ConfigItemImageBrowserFactory.INSTANCE = new ConfigItemImageBrowserFactory();
        }
        return ConfigItemImageBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(_image: ConfigItemImage): Promise<ConfigItemImage> {
        const image = ConfigItemImageFactory.create(_image);
        return image;
    }
}
