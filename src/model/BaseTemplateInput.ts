export class BaseTemplateInput {

    public frontendSocketUrl: string;

    public contentTemplate: string;

    public constructor(frontendSocketUrl: string, contentTemplate: string) {
        this.contentTemplate = contentTemplate;
    }

}
