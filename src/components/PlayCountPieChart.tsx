import * as React from "react";
import { IPlayCountPieChartProps } from "./IPlayCountPieChartProps";
import { IPlayCountPieChartState } from "./IPlayCountPieChartState";
import { Chart } from "chart.js/auto";

export default class PlayCountPieChart extends React.Component<IPlayCountPieChartProps, IPlayCountPieChartState> {
    constructor(props: IPlayCountPieChartProps) {
        super(props);

        this.state = {};
    }

    chartRef: any = React.createRef();
    chartInstance: any = null;

    componentDidMount(): void {
        this.renderChart();
    }

    componentDidUpdate(prevProps: Readonly<IPlayCountPieChartProps>): void {
        if (prevProps.playCountJsonData !== this.props.playCountJsonData) {
            this.destroyChart();
            this.renderChart();
        }
    }

    componentWillUnmount(): void {
        this.destroyChart();
    }

    renderChart() {
        const { labels, counts } = this.prepareChartData(this.props.playCountJsonData);
        const ctx = this.chartRef.current.getContext("2d");
        this.chartInstance = new Chart(ctx, this.prepareChartConfig(labels, counts));
    }

    destroyChart() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    }

    public render() {
        return (
            <canvas ref={this.chartRef} />
        );
    }

    prepareChartData = (playCountJsonData: any): any => {
        const distribution: { [key: string]: number } = {};

        for (let trackIndex = 0; trackIndex < playCountJsonData.length; trackIndex++) {
            if (playCountJsonData[trackIndex].hasOwnProperty("play_count")) {
                const playCountLabel = playCountJsonData[trackIndex].play_count.toString();
                distribution[playCountLabel] = (distribution[playCountLabel] || 0) + 1;
            }
        }

        const labels: string[] = Object.keys(distribution);
        const counts: number[] = Object.values<number>(distribution);

        return { labels, counts };
    }

    prepareChartConfig = (labels: string[], counts: number[]): any => {
        return {
            data: {
                datasets: [
                    {
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)'
                        ],
                        borderWidth: 1,
                        data: counts,
                    }
                ],
                labels: labels
            },
            options: {
                maintainAspectRatio: false,
                responsive: true
            },
            type: "pie"
        };
    }
}