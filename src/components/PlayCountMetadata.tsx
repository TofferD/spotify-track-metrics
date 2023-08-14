import * as React from "react";
import { IPlayCountMetadataProps } from "./IPlayCountMetadataProps";
import { IPlayCountMetadataState } from "./IPlayCountMetadataState";

export default class PlayCountMetadata extends React.Component<IPlayCountMetadataProps, IPlayCountMetadataState> {
    constructor(props: IPlayCountMetadataProps) {
        super(props);

        this.state = {};
    }

    componentDidMount(): void {}

    public render() {
        return (
            <div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Total Play Count: </label>
                    <label>{this.totalPlayCount()}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Unique Play Count: </label>
                    <label>{this.uniquePlaysCount()}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Artist w/ Most Plays: </label>
                    <label>{this.artistWithMostPlays()}</label>
                </div>
            </div>
        );
    }

    artistWithMostPlays = (): string => {
        if (!this.props.playCountJsonData.hasOwnProperty("length")) {
            return "";
        }

        const artistPlayCounts: any = {};

        for (let trackIndex = 0; trackIndex < this.props.playCountJsonData.length; trackIndex++) {
            for (let artistIndex = 0; artistIndex < this.props.playCountJsonData[trackIndex].album.artists.length; artistIndex++) {
                const artistName = this.props.playCountJsonData[trackIndex].album.artists[artistIndex].name;
                if (artistPlayCounts.hasOwnProperty(artistName)) {
                    artistPlayCounts[artistName].playCounts++;
                } else {
                    artistPlayCounts[artistName] = {
                        playCounts: 1
                    }
                }
            }
        }

        let highestPlayCount = 0;
        let highestPlayCountArtist = "";

        for (const prop in artistPlayCounts) {
            if (prop !== "Various Artists" && artistPlayCounts.hasOwnProperty(prop) && artistPlayCounts[prop].playCounts > highestPlayCount) {
                highestPlayCount = artistPlayCounts[prop].playCounts;
                highestPlayCountArtist = prop;
            }
        }

        return `${highestPlayCountArtist} (${highestPlayCount})`;
    }

    totalPlayCount = (): number => {
        if (!this.props.playCountJsonData.hasOwnProperty("length")) {
            return 0;
        }

        return this.props.playCountJsonData.reduce((sum: number, item: { play_count: number }) => sum + item.play_count, 0);
    };

    uniquePlaysCount = (): number => {
        if (!this.props.playCountJsonData.hasOwnProperty("length")) {
            return 0;
        }

        return this.props.playCountJsonData.length;
    }
}