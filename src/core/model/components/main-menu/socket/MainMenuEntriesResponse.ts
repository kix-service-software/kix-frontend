import { MenuEntry } from "..";
import { ISocketResponse } from "../../../socket";

export class MainMenuEntriesResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public primaryMenuEntries: MenuEntry[],
        public secondaryMenuEntries: MenuEntry[],
        public showText: boolean
    ) { }

}
