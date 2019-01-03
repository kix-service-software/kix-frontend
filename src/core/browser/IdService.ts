export class IdService {

    public static generateDateBasedId(prefix: string = ''): string {
        return prefix + (Date.now() + Math.floor((Math.random() * 100000)));
    }

}
