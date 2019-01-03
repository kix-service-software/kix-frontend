import { DisplayImageDescription } from "../components/DisplayImageDescription";

export interface IImageDialogListener {

    open(
        imageDescriptions: DisplayImageDescription[],
        shownImageId?: string | number
    ): void;

}
