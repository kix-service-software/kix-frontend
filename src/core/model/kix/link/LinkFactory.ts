import { Link } from ".";

export class LinkFactory {

    public static create(link: Link): Link {
        return new Link(link);
    }

}
