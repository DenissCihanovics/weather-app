
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Wind, Droplets, CloudRain } from 'lucide-react';

const SortableCity = ({ city, weather, units, onDelete, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: city.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none', // Required for pointer sensor
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        position: 'relative',
        zIndex: isDragging ? 999 : 'auto',
    };

    if (!weather) {
        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="glass-card animate-float"
            onClick={() => onClick(city, weather)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{weather.name}</h2>
                    <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>{weather.sys.country}</span>
                </div>
                <button
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on button click
                    onClick={(e) => { e.stopPropagation(); onDelete(city.id); }}
                    className="delete-btn-hover"
                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px', zIndex: 10 }}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
                <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt={weather.weather[0].description}
                    className="weather-icon"
                />
                <span className="temp-large">{Math.round(weather.main.temp)}°</span>
            </div>

            <p style={{ textTransform: 'capitalize', margin: '0 0 1.5rem 0', opacity: 0.8 }}>
                {weather.weather[0].description}
            </p>

            <div className="glass-panel weather-details" style={{ padding: '0.8rem' }}>
                <div className="detail-item">
                    <Wind size={18} style={{ color: '#64ffda' }} />
                    <span>{weather.wind.speed} {units === 'metric' ? 'm/s' : 'mph'}</span>
                </div>
                <div className="detail-item">
                    <Droplets size={18} style={{ color: '#64ffda' }} />
                    <span>{weather.main.humidity}%</span>
                </div>
                <div className="detail-item">
                    <CloudRain size={18} style={{ color: '#64ffda' }} />
                    <span>{weather.clouds.all}%</span>
                </div>
            </div>
        </div>
    );
};

export default SortableCity;
