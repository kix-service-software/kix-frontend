import { ITableLayer } from ".";
import { CreateLinkDescription } from "../model";

export interface ILinkDescriptionLabelLayer extends ITableLayer {

    setLinkDescriptions(linkDescriptions: CreateLinkDescription[]): void;

}
