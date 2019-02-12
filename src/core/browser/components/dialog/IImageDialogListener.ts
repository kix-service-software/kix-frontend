import { DisplayImageDescription } from "../DisplayImageDescription";

export interface IImageDialogListener {

    open(
        imageDescriptions: DisplayImageDescription[],
        shownImageId?: string | number
    ): void;

}
