/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export interface ICache {

    clear(ignoreTypes?: string[]): Promise<void>;

    get(type: string, key: string): Promise<any>;

    getAll(type: string): Promise<any[]>;

    set(type: string, key: string, value: any): Promise<void>;

    delete(type: string, key: string): Promise<void>;

    deleteAll(type: string): Promise<void>;

}
