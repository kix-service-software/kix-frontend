import { ConfiguredDialogWidget, ObjectIcon } from "../../model";

export interface IMainDialogListener {

    open(
        dialogTitle: string, dialogs: ConfiguredDialogWidget[], dialogId?: string, dialogIcon?: string | ObjectIcon
    ): void;

    close(): void;

    setTitle(title: string);

    setHint(hint: string);

    setLoading(isLoading: boolean, loadingHint: string, showClose: boolean);

}
