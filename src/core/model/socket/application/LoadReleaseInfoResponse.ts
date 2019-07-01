import { ISocketResponse } from "../ISocketResponse";
import { ReleaseInfo } from "../../ReleaseInfo";

export class LoadReleaseInfoResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public releaseInfo: ReleaseInfo
    ) { }

}
