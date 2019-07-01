import { ISocketResponse } from "../ISocketResponse";
import { Bookmark } from "../../components";

export class LoadBookmarksResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public bookmarks: Bookmark[]
    ) { }

}
