
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

import './Modal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ForecastModal = ({ city, units, onClose }) => {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const res = await axios.get(`${API_URL}/forecast`, {
                    params: { city: city.name, units }
                });

                // Process data for chart
                // API returns list every 3 hours. We want to show a nice curve.
                const chartData = res.data.list.map(item => ({
                    time: format(parseISO(item.dt_txt), 'd MMM HH:mm', { locale: enUS }),
                    temp: Math.round(item.main.temp),
                    date: item.dt_txt
                })).slice(0, 16); // Take next 48 hours approx

                // Group by day for daily summary
                const daily = [];
                const seenDates = new Set();
                res.data.list.forEach(item => {
                    const dateStr = item.dt_txt.split(' ')[0];
                    if (!seenDates.has(dateStr)) {
                        seenDates.add(dateStr);
                        daily.push(item);
                    }
                });

                setForecast({ chartData, daily: daily.slice(0, 5) });
            } catch (err) {
                console.error("Error loading forecast", err);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [city, units]);

    if (!city) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-container" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><X /></button>

                <h2 style={{ marginTop: 0, fontSize: '2rem' }}>{city.name}</h2>

                {loading ? (
                    <div className="loader"></div>
                ) : (
                    <>
                        <div style={{ height: '300px', width: '100%', marginTop: '2rem' }}>
                            <h3 style={{ opacity: 0.8, textAlign: 'left' }}>48-Hour Temperature</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={forecast.chartData}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} interval={3} />
                                    <YAxis stroke="rgba(255,255,255,0.5)" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="temp" stroke="#8884d8" fillOpacity={1} fill="url(#colorTemp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="daily-list">
                            <h3 style={{ opacity: 0.8, textAlign: 'left' }}>5-Day Forecast</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                {forecast.daily.map(day => (
                                    <div key={day.dt} className="glass-card" style={{ flex: 1, minWidth: '120px', padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                            {format(parseISO(day.dt_txt), 'EEEE', { locale: enUS })}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                            {format(parseISO(day.dt_txt), 'd MMM', { locale: enUS })}
                                        </div>
                                        <img
                                            src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                                            alt="icon"
                                            style={{ width: '50px' }}
                                        />
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {Math.round(day.main.temp)}°
                                        </div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'capitalize' }}>
                                            {day.weather[0].description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForecastModal;
