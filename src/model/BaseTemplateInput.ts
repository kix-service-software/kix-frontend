export class BaseTemplateInput {

    public frontendSocketUrl: string;

    public contentTemplate: string;

    public templateData: any;

    public constructor(frontendSocketUrl: string, contentTemplate: string, templateData: any) {
        this.contentTemplate = contentTemplate;
        this.templateData = templateData;
    }

}
