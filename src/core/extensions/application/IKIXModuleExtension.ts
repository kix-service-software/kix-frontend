import { UIComponent } from "../../model/UIComponent";

export interface IKIXModuleExtension {

    initComponentIds: string[];

    external: boolean;

    getUIComponents(): UIComponent[];

}
