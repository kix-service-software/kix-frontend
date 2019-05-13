import { UIComponent } from "../../model/UIComponent";

export interface IKIXModuleExtension {

    external: boolean;

    initComponents: UIComponent[];

    getUIComponents(): UIComponent[];

}
