import { ObjectIcon } from "../../model";
import { UIComponentPermission } from "../../model/UIComponentPermission";

export interface IMainMenuExtension {

    icon: string | ObjectIcon;

    text: string;

    mainContextId: string;

    contextIds: string[];

    primaryMenu: boolean;

    permissions: UIComponentPermission[];

    orderRang: number;

}
