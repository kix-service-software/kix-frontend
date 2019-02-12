import { ObjectIcon } from "../../model";

export interface IMainMenuExtension {

    icon: string | ObjectIcon;

    text: string;

    mainContextId: string;

    contextIds: string[];

    primaryMenu: boolean;

}
