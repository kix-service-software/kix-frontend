import { ComponentRouterService } from '@kix/core/dist/browser/router/';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { Context, BreadcrumbDetails } from '@kix/core/dist/model';

class FAQComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

}

module.exports = FAQComponent;
