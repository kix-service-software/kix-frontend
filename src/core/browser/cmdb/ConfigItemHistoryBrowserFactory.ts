/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
