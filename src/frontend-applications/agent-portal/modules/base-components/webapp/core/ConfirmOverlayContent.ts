/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class ConfirmOverlayContent {
    public constructor(
        public text: string,
        public confirmCallback: () => void = null,
        public cancelCallback: () => void = null,
        public buttonLabels: [string, string] = ['Yes', 'No'],
        public decision?: [string, string],
        public focusConfirm?: boolean
    ) { }
}
