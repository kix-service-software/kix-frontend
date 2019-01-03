import { RequestObject } from '../RequestObject';

export class UpdateTextModule extends RequestObject {

    public constructor(
        name: string = null,
        text: string = null,
        keywords: string = null,
        comment: string = null,
        subject: string = null,
        language: string = null,
        category: string = null,
        agentFrontend: number = 0,
        customerFrontend: number = 0,
        publicFrontend: number = 0,
        validId: number = null
    ) {
        super();
        this.applyProperty("Name", name);
        this.applyProperty("Text", text);
        this.applyProperty("Keywords", keywords);
        this.applyProperty("Comment", comment);
        this.applyProperty("Subject", subject);
        this.applyProperty("Language", language);
        this.applyProperty("Category", category);
        this.applyProperty("AgentFrontend", agentFrontend);
        this.applyProperty("CustomerFrontend", customerFrontend);
        this.applyProperty("PublicFrontend", publicFrontend);
        this.applyProperty("ValidID", validId);
    }

}
