import { FAQComponentState } from './model/ComponentState';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { KIXRouterStore } from '@kix/core/dist/browser/router/KIXRouterStore';

class FAQComponent {

    public state: FAQComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new FAQComponentState();
    }

    public onMount(): void {
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'FAQ-Dashboard', null, null);
        KIXRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }
}

module.exports = FAQComponent;
