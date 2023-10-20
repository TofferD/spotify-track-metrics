import * as React from "react";
import { IArtistCountBarGraphProps } from "./IArtistCountBarGraphProps";
import { IArtistCountBarGraphState } from "./IArtistCountBarGraphState";

export default class ArtistCountBarGraph extends React.Component<IArtistCountBarGraphProps, IArtistCountBarGraphState> {
    constructor(props: IArtistCountBarGraphProps) {
        super(props);

        this.state = {};
    }

    chartRef: any = React.createRef();

    componentDidMount(): void {
        this.renderChart();
    }

    public render() {
        return (
            <div></div>
        );
    }

    prepareChartConfig = (artistNames: string[], playCounts: number[], playCountLabels: string[]): any => {
        return {
            data: {
                datasets: [
                    {
                        borderWidth: 1,
                        data: playCounts,
                        label: 'Artist Play Counts'
                    }
                ],
                labels: artistNames
            },
            options: {
                interaction: {
                    intersect: false
                },
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    },
                    datalabels: {
                        align: "end",
                        anchor: "end",
                        color: "white",
                        font: {
                            weight: "bold"
                        },
                        formatter: (value: any, context: any) => {
                            const label = playCountLabels[context.dataIndex];
                            return label.length > 10 ? `${label.substr(0, 10)}...` : label;
                        }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true,
                        position: 'top',
                        ticks: {
                            color: 'white',
                            stepSize: 1
                        }
                    },
                    y: {
                        ticks: {
                            font: {
                                size: 10
                            },
                            color: 'white'
                        },
                        type: 'category'
                    },
                },
            },
            type: "bar"
        };
    }

    prepareChartData = (playCountJsonData: any, startRecord: number, recordsToInclude: number): any => {
        let artistNames: string[] = [];
        let playCounts: number[] = [];
        let playCountLabels: string[] = [];
        const startRecordOptions: number[] = [];
        const recordsToIncludeOptions: number[] = [];
        const artistPlayCounts: any = {};

        for (let trackIndex = 0; trackIndex < playCountJsonData.length; trackIndex++) {
            for (let artistIndex = 0; artistIndex < playCountJsonData[trackIndex].album.artists.length; artistIndex++) {
                const artistName = playCountJsonData[trackIndex].album.artists[artistIndex].name;
                if (artistPlayCounts.hasOwnProperty(artistName)) {
                    artistPlayCounts[artistName].playCounts++;
                } else {
                    artistPlayCounts[artistName] = {
                        playCounts: 1
                    }
                }
            }
        }

        if (Object.keys(artistPlayCounts).length > 0) {
            const sortedData = artistPlayCounts.sort((a: { playCounts: number; }, b: { playCounts: number; }) => b.playCounts - a.playCounts);
            const limitedData = sortedData.slice(startRecord - 1, startRecord - 1 + recordsToInclude);
        }


        // let startRecordOptions: number[] = [];
        // let recordsToIncludeOptions: number[] = [];

        // if (Object.keys(playCountJsonData).length > 0) {
        //     const sortedData = playCountJsonData.sort((a: { play_count: number; }, b: { play_count: number; }) => b.play_count - a.play_count);
        //     const limitedData = sortedData.slice(startRecord - 1, startRecord - 1 + recordsToInclude);

        //     limitedData.forEach((item: { name: string; album: { artists: string[] }; }) => {
        //         item.album.artists.forEach((item: string) => artistNames.indexOf(item) === -1 ? artistNames.push(item);
        //     });

        //     // artistNames = limitedData.map((item: { name: string; album: any; }) => `${item.album.artists[0].name} - ${item.name}`);
        //     playCounts = limitedData.map((item: { play_count: number; }) => item.play_count);
        //     playCountLabels = artistNames.map((label: string) => {
        //         return label.length > 10 ? `${label.substr(0, 10)}...` : label;
        //     });

        //     startRecordOptions = Array.from({ length: this.props.playCountJsonData.length }, (_, index) => index + 1);
        //     recordsToIncludeOptions = [1, 5, 10, 20, 50, 100];
        // }

        // this.setState({
        //     startRecordOptions: startRecordOptions,
        //     recordsToIncludeOptions: recordsToIncludeOptions
        // });

        return { artistNames, playCounts, playCountLabels };
    }
    
    renderChart() {
        const { artistNames, playCounts, playCountLabels } = this.prepareChartData(this.props.playCountJsonData, this.state.startRecord, this.state.recordsToInclude);
        const ctx = this.chartRef.current.getContext("2d");
        this.chartInstance = new Chart(ctx, this.prepareChartConfig(artistNames, playCounts, playCountLabels));
    }    
}