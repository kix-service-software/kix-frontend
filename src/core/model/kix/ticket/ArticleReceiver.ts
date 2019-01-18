import { ArticleProperty } from ".";

export class ArticleReceiver {
    public constructor(
        public email: string,
        public realName: string,
        public type: string = ArticleProperty.TO
    ) { }
}
