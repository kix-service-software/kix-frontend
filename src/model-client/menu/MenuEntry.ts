export class MenuEntry {

    public link: string = "";
    public icon: string = "";
    public text: string = "";
    public active?: boolean = false;

    public constructor(link: string, icon: string, text: string) {
        this.link = link;
        this.icon = icon;
        this.text = text;
    }

}
