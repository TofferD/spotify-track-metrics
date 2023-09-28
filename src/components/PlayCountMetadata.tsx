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
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Longest Song: </label>
                    <label>{this.getLongestSong()}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Shortest Song: </label>
                    <label>{this.getShortestSong()}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Avg Song Length: </label>
                    <label>{this.getAvgSongLength()}</label>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px auto"
                    }}
                >
                    <label>Total Time Listening To Music: </label>
                    <label>{this.getTotalTimeListened()}</label>
                </div>
            </div>
        );
    }

    getTotalTimeListened = (): string => {
        if (!this.props.playCountJsonData.hasOwnProperty("length")) {
            return "";
        }

        const sumOfSongLengths = this.props.playCountJsonData.reduce((sum: number, item: { duration_ms: number, play_count: number }) => sum + (item.duration_ms * item.play_count), 0);
        const secInMs = 1000;
        const minInMs = 60000;
        const hourInMs = 3600000
        const dayInMs = 86400000
        const daysListened = Math.trunc(sumOfSongLengths / dayInMs);
        const hoursListened = Math.trunc((sumOfSongLengths % dayInMs) / hourInMs);
        const minutesListened = Math.trunc(((sumOfSongLengths % dayInMs) % hourInMs) / minInMs);
        const secondsListened = Math.trunc((((sumOfSongLengths % dayInMs) % hourInMs) % minInMs) / secInMs);
        const millisecondsListened = (((sumOfSongLengths % dayInMs) % hourInMs) % minInMs) % secInMs;

        return `${daysListened}d : ${hoursListened}h : ${minutesListened}m : ${secondsListened}s : ${millisecondsListened}ms`;
    }

    getAvgSongLength = (): string => {
        if (!this.props.playCountJsonData.hasOwnProperty("length")) {
            return "";
        }

        const avgSongLength = (this.props.playCountJsonData.reduce((sum: number, item: { duration_ms: number, play_count: number }) => sum + (item.duration_ms * item.play_count), 0) / this.totalPlayCount());
        const dateTimeFromMs = new Date(avgSongLength);

        return `${dateTimeFromMs.getUTCHours()}h : ${dateTimeFromMs.getUTCMinutes()}m : ${dateTimeFromMs.getUTCSeconds()}s`;
    }

    getShortestSong = (): string => {
        if (!this.props.playCountJsonData.hasOwnProperty("length")) {
            return "";
        }

        const minLengthSong = this.props.playCountJsonData.reduce((prev: any, current: any) => (prev.duration_ms < current.duration_ms) ? prev : current);
        const dateTimeFromMs = new Date(minLengthSong.duration_ms);
       
        return `${minLengthSong.name} (${dateTimeFromMs.getUTCHours()}h : ${dateTimeFromMs.getUTCMinutes()}m : ${dateTimeFromMs.getUTCSeconds()}s)`;
    }

    getLongestSong = (): string => {
        if (!this.props.playCountJsonData.hasOwnProperty("length")) {
            return "";
        }

        const maxLengthSong = this.props.playCountJsonData.reduce((prev: any, current: any) => (prev.duration_ms > current.duration_ms) ? prev : current);
        const dateTimeFromMs = new Date(maxLengthSong.duration_ms);
       
        return `${maxLengthSong.name} (${dateTimeFromMs.getUTCHours()}h : ${dateTimeFromMs.getUTCMinutes()}m : ${dateTimeFromMs.getUTCSeconds()}s)`;
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