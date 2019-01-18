export class PersonalSettings {

    public id: string;

    public name: string;

    public description: string;

    public templatePath: string;

    public configuration: any;

    public configurationContent: any;

    public constructor(
        id: string, name: string, description: string,
        templatePath: string, configuration: any, configurationContent: any
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.templatePath = templatePath;
        this.configuration = configuration;
        this.configurationContent = configurationContent;
    }

}
