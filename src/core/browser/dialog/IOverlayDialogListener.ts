import { ConfiguredDialogWidget, ObjectIcon } from "../../model";

export interface IOverlayDialogListener {

    open(
        dialogTagId: string, input?: any, title?: string, icon?: string | ObjectIcon
    ): void;

    close(): void;

    setLoading(loading: boolean): void;

}
