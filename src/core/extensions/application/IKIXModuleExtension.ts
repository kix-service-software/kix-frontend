import { UIComponent } from "../../model/UIComponent";

export interface IKIXModuleExtension {

    id: string;

    external: boolean;

    initComponents: UIComponent[];

    uiComponents: UIComponent[];

}
