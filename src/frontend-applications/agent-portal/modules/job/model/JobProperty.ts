/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum JobProperty {

    ID = 'ID',

    NAME = 'Name',

    TYPE = 'Type',

    MACROS = 'Macros',

    MACROS_IDS = 'MacroIDs',

    EXEC_PLANS = 'ExecPlans',

    EXEC_PLAN_IDS = 'ExecPlanIDs',

    LAST_EXEC_TIME = 'LastExecutionTime',

    FILTER = 'Filter',

    EXEC = 'Exec',

    // ui properties
    ACTION_COUNT = 'ACTION_COUNT',
    MACRO_ACTIONS = 'MACRO_ACTIONS',
    HAS_TRIGGER_EVENTS = 'HAS_TRIGGER_EVENTS',
    HAS_TRIGGER_TIMES = 'HAS_TRIGGER_TIMES',
    EXEC_PLAN_EVENTS = 'EXEC_PLAN_EVENTS',
    EXEC_PLAN_WEEKDAYS = 'WEEKDAYS',
    EXEC_PLAN_WEEKDAYS_TIMES = 'WEEKDAYS_TIME'

}
