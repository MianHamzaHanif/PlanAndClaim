import React from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler
} from "chart.js";
import "./Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const ChartCard = ({ title, value, labels, dataPoints }) => {
    const data = {
        labels,
        datasets: [
        {
            data: dataPoints,
            fill: true,
            backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, "rgba(255, 122, 26, 0.8)");
            gradient.addColorStop(1, "rgba(255, 122, 26, 0.1)");
            return gradient;
            },
            borderColor: "#ff7a1a",
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#ff7a1a"
        }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
            label: (context) => `$ ${context.parsed.y}`
            }
        }
        },
        scales: {
        x: {
            grid: { color: "#555" },
            ticks: { color: "#aaa" }
        },
        y: {
            grid: { color: "#555" },
            ticks: { color: "#aaa" }
        }
        }
    };

    return (
        <div className="card bg-dark text-white mb-4">
            <div className="card-body">
                <div className="stat-title mb-1">{title}</div>
                <div className="stat-value mb-3">{value}</div>
                <div style={{ height: "350px" }}>
                <Line data={data} options={options} />
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const days = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];

    return (
        <div className="Dashboard">
            <Header />
                <div className="container-fluid py-4 pt-5">
                    <div className="row mb-3 pt-5">
                        <div className="col-12">
                        <h4 className="Heading text-white">Statistics</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 col-md-6">
                        <ChartCard title="AS Market Cap" value="$ 117,843,691.88" labels={days} dataPoints={[93, 95, 98, 100, 105, 110, 117]} />
                        </div>
                        <div className="col-12 col-md-6">
                        <ChartCard title="AS Price" value="$ 27.36" labels={days} dataPoints={[21.2, 21.3, 21.5, 21.7, 21.9, 22.1, 27.36]} />
                        </div>
                        <div className="col-12 col-md-6">
                        <ChartCard title="AS Circulating Supply" value="4,307,064.95" labels={days} dataPoints={[3.5, 3.6, 3.8, 4.0, 4.1, 4.2, 4.3]} />
                        </div>
                        <div className="col-12 col-md-6">
                        <ChartCard title="AS Staked Amount" value="991,034.84" labels={days} dataPoints={[750, 780, 800, 820, 850, 900, 991]} />
                        </div>
                    </div>
                </div>
            <Footer />
        </div>
    );
};

export default Dashboard;
