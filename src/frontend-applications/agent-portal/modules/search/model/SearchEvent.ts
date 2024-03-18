/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

    LOAD_SHARED_SEARCHES = 'LOAD_SHARED_SEARCHES',
    SHARED_SEARCHES_LOADED = 'SHARED_SEARCHES_LOADED',

    SEARCH_CACHE_CHANGED = 'SEARCH_CACHE_CHANGED'

}
