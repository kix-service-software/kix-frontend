import { IKIXObjectFactory } from '../kix';
import { ConfigItemHistory } from '../../model';

export class ConfigItemHistoryBrowserFactory implements IKIXObjectFactory<ConfigItemHistory> {

    private static INSTANCE: ConfigItemHistoryBrowserFactory;

    public static getInstance(): ConfigItemHistoryBrowserFactory {
        if (!ConfigItemHistoryBrowserFactory.INSTANCE) {
            ConfigItemHistoryBrowserFactory.INSTANCE = new ConfigItemHistoryBrowserFactory();
        }
        return ConfigItemHistoryBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(history: ConfigItemHistory): Promise<ConfigItemHistory> {
        return new ConfigItemHistory(history);
    }


}
