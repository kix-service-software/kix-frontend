import { Context } from '../../../../model/Context';

export class ElasticSearchContext extends Context {
    public static CONTEXT_ID: string = 'elasticsearch';

    public async getDisplayText(): Promise<string> {
        let text = 'ElasticSearch';
        return text;
    }
}