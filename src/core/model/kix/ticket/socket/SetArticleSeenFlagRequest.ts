import { ISocketRequest } from "../../../socket";

export class SetArticleSeenFlagRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public ticketId: number,
        public articleId: number
    ) { }
}
