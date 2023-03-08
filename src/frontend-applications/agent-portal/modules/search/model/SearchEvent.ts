/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum SearchEvent {

    SAVE_SEARCH = 'SAVE_SEARCH',
    SAVE_SEARCH_FINISHED = 'SAVE_SEARCH_FINISHED',

    LOAD_SEARCH = 'LOAD_SEARCH',
    SEARCH_LOADED = 'SEARCH_LOADED',

    DELETE_SEARCH = 'DELETE_SEARCH',
    SEARCH_DELETED = 'SEARCH_DELETED',

    SEARCH_CACHE_CHANGED = 'SEARCH_CACHE_CHANGED'

}
