import { KIXObject } from "..";
import { LinkTypeDescription } from "./LinkTypeDescription";

export class CreateLinkDescription<T extends KIXObject = KIXObject> {

    public constructor(
        public linkableObject: T,
        public linkTypeDescription: LinkTypeDescription
    ) { }

}
