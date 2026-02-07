
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudRain, Wind, Droplets, Trash2, Plus, Thermometer } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import ForecastModal from './ForecastModal';
import SortableCity from './SortableCity';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function App() {
  const [cities, setCities] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [units, setUnits] = useState('metric');
  const [newCity, setNewCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Require 5px movement to start drag (prevents accidental clicks)
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      updateAllWeather();
    }
  }, [cities, units]);

  const fetchCities = async () => {
    try {
      const res = await axios.get(`${API_URL}/cities`);
      setCities(res.data);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const updateAllWeather = async () => {
    setLoading(true);
    const newWeatherData = {};

    // Fetch in parallel
    await Promise.all(cities.map(async (city) => {
      try {
        const res = await axios.get(`${API_URL}/weather`, {
          params: { city: city.name, units }
        });
        newWeatherData[city.id] = res.data;
      } catch (err) {
        console.error(`Failed to fetch weather for ${city.name}`, err);
      }
    }));

    setWeatherData(newWeatherData);
    setLoading(false);
  };

  const addCity = async (e) => {
    e.preventDefault();
    if (!newCity.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/cities`, { name: newCity });
      setCities(prev => [...prev, res.data]);
      setNewCity('');
    } catch (err) {
      alert('Failed to add city. Verification failed or connection error.');
    }
  };

  const deleteCity = async (id) => {
    try {
      await axios.delete(`${API_URL}/cities/${id}`);
      setCities(prev => prev.filter(c => c.id !== id));
      const newW = { ...weatherData };
      delete newW[id];
      setWeatherData(newW);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCities((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Persist order
        const orderedIds = newOrder.map(c => c.id);
        axios.put(`${API_URL}/cities/reorder`, { orderedIds }).catch(console.error);

        return newOrder;
      });
    }
  };

  return (
    <div className="container">
      <header className="glass-container" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>World Weather</h1>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="switch" onClick={() => setUnits(u => u === 'metric' ? 'imperial' : 'metric')}>
            <input type="checkbox" checked={units === 'imperial'} readOnly />
            <span className="slider"></span>
          </div>
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{units === 'metric' ? 'Metric System' : 'Imperial System'}</span>
        </div>

        <form onSubmit={addCity} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Enter city..."
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            style={{ width: '200px' }}
          />
          <button type="submit" className="glass-btn"><Plus size={20} /></button>
        </form>
      </header>

      {/* Grid of Cities - Sortable */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid-layout">
          <SortableContext items={cities.map(c => c.id)} strategy={rectSortingStrategy}>
            {cities.map(city => (
              <SortableCity
                key={city.id}
                city={city}
                weather={weatherData[city.id]}
                units={units}
                onDelete={deleteCity}
                onClick={(city, weather) => setSelectedCity({ id: city.id, name: weather.name })}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {selectedCity && (
        <ForecastModal
          city={selectedCity}
          units={units}
          onClose={() => setSelectedCity(null)}
        />
      )}
    </div>
  );
}

export default App;
