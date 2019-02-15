import { KIXObject } from "../../kix";
import { ITable } from "../../../browser";

export interface IActionListener {

    listenerInstanceId: string;

    actionDataChanged(data?: KIXObject[] | ITable): void;

    actionsChanged(): void;

}
