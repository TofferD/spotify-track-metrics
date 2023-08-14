import * as React from "react";
import { IPlayCountBarGraphProps } from "./IPlayCountBarGraphProps";
import { IPlayCountBarGraphState } from "./IPlayCountBarGraphState";
import { ArcElement, Chart, ChartMeta } from "chart.js/auto";

export default class PlayCountBarGraph extends React.Component<IPlayCountBarGraphProps, IPlayCountBarGraphState> {
    constructor(props: IPlayCountBarGraphProps) {
        super(props);

        this.state = {
            startRecord: 1,
            recordsToInclude: 50,
            startRecordOptions: [],
            recordsToIncludeOptions: []
        };
    }

    chartRef: any = React.createRef();
    chartInstance: any = null;
    tooltipRef: any = React.createRef();

    componentDidMount(): void {
        this.renderChart();
    }

    componentDidUpdate(prevProps: Readonly<IPlayCountBarGraphProps>): void {
        if (prevProps.playCountJsonData !== this.props.playCountJsonData) {
            this.destroyChart();
            this.renderChart();
        }
    }

    componentWillUnmount(): void {
        this.destroyChart();
    }

    renderChart() {
        const { trackNames, playCounts, playCountLabels } = this.prepareChartData(this.props.playCountJsonData, this.state.startRecord, this.state.recordsToInclude);
        const ctx = this.chartRef.current.getContext("2d");
        this.chartInstance = new Chart(ctx, this.prepareChartConfig(trackNames, playCounts, playCountLabels));
    }

    destroyChart() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    }

    public render() {
        return (
            <div>
                <div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "200px 50px"
                        }}
                    >
                        <label>Start Record: </label>
                        <select value={this.state.startRecord} onChange={this.setStartRecord}>
                            {this.state.startRecordOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "200px 50px"
                        }}
                    >
                        <label htmlFor="recToInclude">Records to Include: </label>
                        <select id="recToInclude" value={this.state.recordsToInclude} onChange={this.setRecordsToInclude}>
                            {this.state.recordsToIncludeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div
                    style={{
                        padding: "0",
                        margin: "0",
                        overflow: "hidden",
                        overflowY: "scroll",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        msOverflowY: "scroll"
                    }}
                >
                    <div ref={this.tooltipRef} />
                    <canvas ref={this.chartRef} />
                </div>
            </div>
        )
    }

    setStartRecord = (event: any): void => {
        this.setState({
            startRecord: Number(event.target.value)
        }, () => {
            this.destroyChart();
            this.renderChart();
        });
    }

    setRecordsToInclude = (event: any): void => {
        this.setState({
            recordsToInclude: Number(event.target.value)
        }, () => {
            this.destroyChart();
            this.renderChart();
        });
    }

    prepareChartData = (playCountJsonData: any, startRecord: number, recordsToInclude: number): any => {
        let trackNames: string[] = [];
        let playCounts: number[] = [];
        let playCountLabels: string[] = [];
        let startRecordOptions: number[] = [];
        let recordsToIncludeOptions: number[] = [];

        if (Object.keys(playCountJsonData).length > 0) {
            const sortedData = playCountJsonData.sort((a: { play_count: number; }, b: { play_count: number; }) => b.play_count - a.play_count);
            const limitedData = sortedData.slice(startRecord - 1, startRecord - 1 + recordsToInclude);
            trackNames = limitedData.map((item: { name: string; }) => item.name);
            playCounts = limitedData.map((item: { play_count: number; }) => item.play_count);
            playCountLabels = trackNames.map((label: string) => {
                return label.length > 10 ? `${label.substr(0, 10)}...` : label;
            });

            startRecordOptions = Array.from({ length: this.props.playCountJsonData.length }, (_, index) => index + 1);
            recordsToIncludeOptions = [1, 5, 10, 20, 50, 100];
        }

        this.setState({
            startRecordOptions: startRecordOptions,
            recordsToIncludeOptions: recordsToIncludeOptions
        });

        return { trackNames, playCounts, playCountLabels };
    }

    showTooltip = (context: MouseEvent, index: number) => {
        const tooltipElement = this.tooltipRef.current;

        if (index && tooltipElement) {
            const meta = this.chartRef.current?.getDatasetMeta(0) as ChartMeta<"bar">;
            const data = meta.data[index] as ArcElement;

            const { x, y } = data.getCenterPoint(true) || { x: 0, y: 0 };
            const songName = this.chartRef.current?.data.labels?.[index];
            const song = this.props.playCountJsonData.find((item: { name: string }) => item.name === songName);

            if (song) {
                tooltipElement.style.display = 'block';
                tooltipElement.style.left = x + 'px';
                tooltipElement.style.top = y + 'px';
                tooltipElement.innerHTML = `
              <div>
                <div><strong>Artist:</strong> ${song.album.artists[0].name}</div>
                <div><strong>Album:</strong> ${song.album.name}</div>
              </div>
            `;
            }
        }
    }

    hideTooltip = () => {
        if (this.tooltipRef.current) {
            this.tooltipRef.current.style.display = 'none';
        }
    }

    prepareChartConfig = (trackNames: string[], playCounts: number[], playCountLabels: string[]): any => {
        return {
            data: {
                datasets: [
                    {
                        borderWidth: 1,
                        data: playCounts,
                        label: 'Play Counts'
                    }
                ],
                labels: trackNames
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
                // onHover: (event: any, activeElements: any[]) => {
                //     if (activeElements.length > 0) {
                //         const index = activeElements[0].index;
                //         this.showTooltip(event, index);
                //     } else {
                //         this.hideTooltip();
                //     }
                // }
            },
            type: "bar"
        };
    }
}