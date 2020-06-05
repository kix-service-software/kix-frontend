/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfiguredDialogWidget } from '../../../../model/configuration/ConfiguredDialogWidget';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';

export interface IMainDialogListener {

    open(
        dialogTitle: string, dialogs: ConfiguredDialogWidget[], dialogId?: string, dialogIcon?: string | ObjectIcon
    ): void;

    close(data?: any): void;

    submit(data?: any): void;

    setTitle(title: string): void;

    setHint(hint: string): void;

    setLoading(
        isLoading: boolean, loadingHint: string, showClose: boolean, time: number, cancelCallback: () => void
    ): void;

}
