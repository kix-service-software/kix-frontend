import { KIXObject } from "../../kix";
import { StandardTable } from "../../../browser";

export interface IActionListener {

    listenerInstanceId: string;

    actionDataChanged(data?: KIXObject[] | StandardTable): void;

    actionsChanged(): void;

}
