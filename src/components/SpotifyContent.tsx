import * as React from "react";
import { ISpotifyContentProps } from "./ISpotifyContentProps";
import { ISpotifyContentState } from "./ISpotifyContentState";
import SpotifyBusinessLogic from "./SpotifyBusinessLogic";
import PlayCountMetadata from "./PlayCountMetadata";
import PlayCountPieChart from "./PlayCountPieChart";
import PlayCountBarGraph from "./PlayCountBarGraph";

export default class SpotifyContent extends React.Component<ISpotifyContentProps, ISpotifyContentState> {
    private businessLogic: SpotifyBusinessLogic;

    constructor(props: ISpotifyContentProps) {
        super(props);

        this.state = {
            playCountJsonData: {},
            showPlayCountGraph: true,
            showPlayCountGraphButton: false
        };

        this.businessLogic = new SpotifyBusinessLogic();
    }

    componentDidMount(): void {
        this.getPlayCountJsonAsync();
    }

    public render() {
        return (
            <div className="App">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "25% auto 25%"
                    }}
                >
                    <span>
                        <PlayCountMetadata
                            playCountJsonData={this.state.playCountJsonData}
                        />
                    </span>
                    <span></span>
                    <span>
                        <PlayCountPieChart
                            playCountJsonData={this.state.playCountJsonData}
                        />
                    </span>
                </div>
                <div
                    onMouseEnter={() => this.onShowPlayCountGraphButton(true)}
                    onMouseLeave={() => this.onShowPlayCountGraphButton(false)}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "auto auto"
                        }}
                    >
                        <span
                            style={{
                                cursor: "pointer",
                                margin: "5px",
                                visibility: this.state.showPlayCountGraphButton ? "visible" : "hidden"
                            }}
                            onClick={this.onShowPlayCountGraph}
                        >
                            ≡
                        </span>
                        <span>Individual Track Play Count Graph</span>
                    </div>
                    <div
                        style={{
                            visibility: this.state.showPlayCountGraph ? "visible" : "hidden"
                        }}
                    >
                        <PlayCountBarGraph
                            playCountJsonData={this.state.playCountJsonData}
                        />
                    </div>
                </div>
            </div>
        );
    }

    getPlayCountJsonAsync = async (): Promise<void> => {
        const playCountJsonData = await this.businessLogic.getPlayCountJsonAsync();

        this.setState({
            playCountJsonData: playCountJsonData
        });
    }

    onShowPlayCountGraph = (event: any): void => {
        this.setState({
            showPlayCountGraph: !this.state.showPlayCountGraph
        });
    }

    onShowPlayCountGraphButton = (showGraph: boolean): void => {
        this.setState({
            showPlayCountGraphButton: showGraph
        });
    }
}