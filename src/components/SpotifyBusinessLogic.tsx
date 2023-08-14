export default class SpotifyBusinessLogic {
    getPlayCountJsonAsync = async (): Promise<any> => {
        let playCountDataJson: any = {};

        try {
            playCountDataJson = (await import('PlayCounts.json')).default;
        } finally {
            return playCountDataJson;
        }
    }
}