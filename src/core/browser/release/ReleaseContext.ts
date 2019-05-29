import { Context } from '../../model/components/context/Context';

export class ReleaseContext extends Context {

    public static CONTEXT_ID: string = 'release';

    public getIcon(): string {
        return 'kix-icon-conversationguide';
    }

    public async getDisplayText(): Promise<string> {
        return 'Release Informationen';
    }

}
