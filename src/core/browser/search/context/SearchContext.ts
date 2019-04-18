import { ObjectIcon } from "../../../model";
import { Context } from '../../../model/components/context/Context';

export class SearchContext extends Context {

    public static CONTEXT_ID = 'search';

    public getIcon(): string | ObjectIcon {
        return "kix-icon-search";
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return short ? 'Translatable#Results advanced search' : 'Translatable#Advanced Search';
    }

}
