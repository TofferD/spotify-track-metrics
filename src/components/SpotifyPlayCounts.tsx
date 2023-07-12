import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto"
import { ArcElement, ChartMeta, ChartDataset, ChartOptions, TooltipItem, ChartData } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

const SpotifyPlayCounts: React.FC = () => {  
  const [playCountJsonData, setPlayCountJsonData] = useState<any>(null);
  const [startRecord, setStartRecord] = useState<number>(1);
  const [recordsToInclude, setRecordsToInclude] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalPlayCount, setTotalPlayCount] = useState<number>(0);  
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const pieChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const pieChartInstanceRef = useRef<Chart<"pie"> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await import('PlayCounts.json');
        const jsonData = response.default;
        setPlayCountJsonData(response.default);
        const totalCount = jsonData.reduce((sum: number, item: { play_count: number }) => sum + item.play_count, 0);
        setTotalPlayCount(totalCount);
      } catch (error) {
        console.error('Error fetching JSON data:', error);
      }
    };

    fetchData();
  }, []);

  const countPlayCountDistribution = (data: any[]): { [key: string]: number } => {
    const distribution: { [key: string]: number } = {};
  
    data.forEach((item: { play_count: number }) => {
      const playCount = item.play_count.toString();
      distribution[playCount] = (distribution[playCount] || 0) + 1;
    });
  
    return distribution;
  };

  const generateChart = async () => {
    if (!playCountJsonData || !chartRef.current) return;
           
    const sortedData = playCountJsonData.sort((a: { play_count: number; }, b: { play_count: number; }) => b.play_count - a.play_count);
    const limitedData = sortedData.slice(startRecord - 1, startRecord - 1 + recordsToInclude);
    const playCounts = limitedData.map((item: { play_count: number; }) => item.play_count);
    const trackNames = limitedData.map((item: { name: string; }) => item.name);
    const artistNames = limitedData.map((item: { artist: string }) => item.artist);
    const albumNames = limitedData.map((item: { album: string }) => item.album);
    const playCountLabels = trackNames.map((label: string) => {
      return label.length > 10 ? `${label.substr(0, 10)}...` : label;
    });
  
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');

      if (ctx) {  
        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: trackNames,
            datasets: [
              {
                label: 'Play Counts',
                data: playCounts,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
              },
            ],
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
            onHover: (event: any, activeElements: any[]) => {
              if (activeElements.length > 0) {
                const index = activeElements[0].index;
                showTooltip(event, index);
              } else {
                hideTooltip();
              }
            }
          }
        });
      }

      if (pieChartRef.current) {
        if (pieChartInstanceRef.current) {
          pieChartInstanceRef.current.destroy();
        }

        const pieCtx = pieChartRef.current.getContext('2d');

        if (pieCtx) {
          const playCountDistribution = countPlayCountDistribution(playCountJsonData);
          const playCountLabels = Object.keys(playCountDistribution);
          const playCountData = Object.values<number>(playCountDistribution);

          pieChartInstanceRef.current = new Chart(pieCtx, {
            type: 'pie',
            data: {
              labels: playCountLabels,
              datasets: [
                {
                  data: playCountData,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                  ]
                }
              ]
            },
            options: {
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = playCountLabels[context.dataIndex];
                      const value = playCountData[context.dataIndex];
                      return `${label}: ${value} songs`;
                    }
                  },                  
                  enabled: true
                }
              },
              responsive: true
            }
          });
          
          const legendItems = pieChartInstanceRef.current?.legend?.legendItems || [];
          const legendHTML = legendItems
            .map((item) => {
              return `<div class="legend-item">
                        <span class="legend-color" style="background-color: ${item.fillStyle}"></span>
                        <span class="legend-label">${item.text}</span>
                      </div>`;
            })
            .join('');

          const pieChartContainer = document.querySelector('.PieChartContainer');

          if (pieChartContainer) {
            pieChartInstanceRef.current.canvas.innerHTML = `<div class="legend-container">${legendHTML}</div>`;
          }
        }
      }
    }    
  };

  useEffect(() => {
    generateChart();
  }, [playCountJsonData, startRecord, recordsToInclude]);

  const startRecordOptions = playCountJsonData ? Array.from({ length: playCountJsonData.length }, (_, index) => index + 1) : [];
  const recordsToIncludeOptions = [1, 5, 10, 20, 50, 100];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  
    if (query.trim() === '') {
      setFilteredSongs([]);
    } else {
      const filtered = playCountJsonData.filter((song: { name: string }) =>
        song.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSongs(filtered.map((song: { name: string }) => song.name));
    }
  };

  const handleSongSelection = (selectedSong: string) => {
    const index = playCountJsonData.findIndex(
      (item: { name: string }) => item.name === selectedSong
    );
    if (index !== -1) {
      setStartRecord(index + 1);
    }
  };

  const [filteredSongs, setFilteredSongs] = useState<string[]>([]);

  const showTooltip = (context: MouseEvent, index: number) => {
    const tooltipElement = tooltipRef.current;

    if (index && tooltipElement) {
      const meta = chartInstanceRef.current?.getDatasetMeta(0) as ChartMeta<"bar">;
      const data = meta.data[index] as ArcElement;

      const { x, y } = data.getCenterPoint(true) || { x: 0, y: 0 };
      const songName = chartInstanceRef.current?.data.labels?.[index];
      const song = playCountJsonData.find((item: { name: string }) => item.name === songName);
  
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
  };

  const hideTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };

  return (
    <div className="App">
      <div className="Controls">
        <div className="SelectionControls">
          <div>
            <label htmlFor="start">Start Record: </label>
            <select id="start" value={startRecord} onChange={(e) => setStartRecord(Number(e.target.value))}>
              {startRecordOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="recToInclude">Records to Include: </label>
            <select id="recToInclude" value={recordsToInclude} onChange={(e) => setRecordsToInclude(Number(e.target.value))}>
              {recordsToIncludeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div>
            <label htmlFor="totalCount">Total Play Count: </label>
            <label id="totalCount">{totalPlayCount}</label>
          </div>
          <div className="SearchResults">
            <label htmlFor="search">Search For Song: </label>
            <input id="search" type="text" value={searchQuery} onChange={handleSearchChange} />
            {filteredSongs.length > 0 && (
              <ul className="SearchResults">
                {filteredSongs.map((song) => (<li key={song} onClick={() => handleSongSelection(song)}>{song}</li>))}
              </ul>
            )}
          </div>
          <div ref={tooltipRef} className="tooltip" />
        </div>
        <div className="PieChartContainer">
          <canvas ref={pieChartRef}></canvas>
        </div>
      </div>
      <div className="ChartContainer">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};
  
export default SpotifyPlayCounts;
