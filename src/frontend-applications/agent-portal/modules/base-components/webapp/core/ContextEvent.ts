/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum ContextEvent {

    LOAD_CONTEXT_CONFIGURATION = 'load-context',
    CONTEXT_CONFIGURATION_LOADED = 'context-loaded',

    LOAD_CONTEXT_CONFIGURATIONS = 'LOAD_CONTEXT_CONFIGURATIONS',
    CONTEXT_CONFIGURATIONS_LOADED = 'CONTEXT_CONFIGURATIONS_LOADED',

    REBUILD_CONFIG = 'REBUILD_CONFIG',
    REBUILD_CONFIG_FINISHED = 'REBUILD_CONFIG_FINISHED'

}
