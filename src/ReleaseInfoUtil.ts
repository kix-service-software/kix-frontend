import { ReleaseInfo } from "./core/model";

export class ReleaseInfoUtil {

    public static async getReleaseInfo(): Promise<ReleaseInfo> {
        return new Promise<ReleaseInfo>((resolve, reject) => {
            const reader = require('readline').createInterface({
                input: require('fs').createReadStream('./RELEASE')
            });

            const releaseInfo = new ReleaseInfo();
            reader.on('line', (line: string) => {
                const releaseValue = line.split(' = ');
                if (releaseValue && releaseValue.length === 2) {
                    if (releaseValue[0] === 'PRODUCT') {
                        releaseInfo.product = releaseValue[1];
                    } else if (releaseValue[0] === 'VERSION') {
                        releaseInfo.version = releaseValue[1];
                    } else if (releaseValue[0] === 'BUILDDATE') {
                        releaseInfo.buildDate = releaseValue[1];
                    } else if (releaseValue[0] === 'BUILDHOST') {
                        releaseInfo.buildHost = releaseValue[1];
                    } else if (releaseValue[0] === 'BUILDNUMBER') {
                        releaseInfo.buildNumber = Number(releaseValue[1]);
                    }
                }
            });

            reader.on('close', () => {
                resolve(releaseInfo);
            });
        });
    }

}
