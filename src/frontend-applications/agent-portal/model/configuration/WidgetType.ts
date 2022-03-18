/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum WidgetType {

    CONTENT = 1 << 0,

    SIDEBAR = 1 << 1,

    EXPLORER = 1 << 2,

    LANE = 1 << 3,

    GROUP = 1 << 4,

    OVERLAY = 1 << 5,

    DIALOG = 1 << 6,

    OVERLAY_DIALOG = 1 << 7

}
