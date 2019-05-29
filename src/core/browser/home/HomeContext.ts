import { Context } from "../../model";

export class HomeContext extends Context {

    public static CONTEXT_ID: string = 'home';

    public getIcon(): string {
        return 'kix-icon-home';
    }

    public async getDisplayText(): Promise<string> {
        return 'Home Dashboard';
    }

}
