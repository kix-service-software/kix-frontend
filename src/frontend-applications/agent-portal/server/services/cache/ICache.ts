/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export interface ICache {

    clear(ignoreKeyPrefixes?: string[]): Promise<void>;

    get(key: string, cacheKeyPrefix: string): Promise<any>;

    set(key: string, cacheKeyPrefix: string, value: any): Promise<void>;

    delete(key: string, cacheKeyPrefix: string): Promise<void>;

    deleteKeys(cacheKeyPrefix: string): Promise<void>;

}
