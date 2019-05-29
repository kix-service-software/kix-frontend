import { Context, AdminModule, KIXObjectType } from "../../../model";

export class AdminContext extends Context {

    public static CONTEXT_ID: string = 'admin';

    public adminModule: AdminModule;
    public categoryName: string;

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(): Promise<string> {
        return 'Admin Dashboard';
    }

    public setAdminModule(adminModule: AdminModule, categoryName: string): void {
        if (!this.adminModule || this.adminModule.id !== adminModule.id) {
            this.adminModule = adminModule;
            this.categoryName = categoryName;
            this.listeners.forEach((l) => l.objectChanged(adminModule.id, adminModule, KIXObjectType.ANY));
        }
    }

    public reset(): void {
        super.reset();
        this.adminModule = null;
        this.categoryName = null;
    }

}
