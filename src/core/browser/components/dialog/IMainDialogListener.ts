import { ConfiguredDialogWidget, ObjectIcon } from "../../../model";

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
