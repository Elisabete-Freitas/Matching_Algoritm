import React, { useState, useEffect } from 'react';
import { URL } from '../../config';
import Spinner from '../shared/Spinner';
import "./SettingsPage.css"

const SettingsPage = () => {
    const [formData, setFormData] = useState({
        cropType: '',
        area: '',
        beehivesNeeded: '',
        startDate: '',
        endDate: ''
    });
    const [entries, setEntries] = useState([]);
    const [usedCropTypes, setUsedCropTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        const response = await fetch(`${URL}/beeland-api/settings/hives-per-culture`);
        if (response.ok) {
            const data = await response.json();
            setEntries(data);
            const usedTypes = new Set(data.map(item => item.cropType));
            setUsedCropTypes([...usedTypes]);
            setIsLoading(false);
        } else {
            console.error('Failed to fetch entries');
        }
    };
    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${URL}/beeland-api/settings/hives-per-culture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                throw new Error('Failed to submit the form');
            }
            const result = await response.json();
            console.log('Form submitted successfully:', result);
            setFormData({
                cropType: '',
                area: '',
                beehivesNeeded: '',
                startDate: '',
                endDate: ''
            });
            fetchEntries();  // Re-fetch entries to update the list
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

    const handleDelete = async (id) => {
        try {
            await fetch(`${URL}/beeland-api/settings/hives-per-culture/${id}`, {
                method: 'DELETE'
            });
            fetchEntries();  // Re-fetch entries to update the list
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const cropTypes = ["Amêndoal", "Cerejal", "Pomar", "Morangal", "Framboesal"];  // Example crop types

    return (
        <div className='settings-page-container'>
            <h3 className='content-title'>Relação de Colmeias para tipo de Cultura</h3>
            <form onSubmit={handleSubmit} className='settings-page-form'>
            <div className='settings-page-form-input-wrapper'>
    <label>Tipo de Cultura:</label>
    <input
        type="text"
        name="cropType"
        value={formData.cropType}
        onChange={handleChange}
        placeholder="Digite o tipo de cultura"
        required
    />
</div>
                <div className='settings-page-form-input-wrapper'>
                    <label>Área (ha):</label>
                    <input
                        type="number"
                        name="area"
                        min={1}
                        value={formData.area}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className='settings-page-form-input-wrapper'>
                    <label>N.º Colmeias Necessárias:</label>
                    <input
                        type="number"
                        min={1}
                        name="beehivesNeeded"
                        value={formData.beehivesNeeded}
                        onChange={handleChange}
                        required
                    />
                </div>
              {/*  <div className='settings-page-form-input-wrapper'>
                    <label>Início da Polinização:</label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className='settings-page-form-input-wrapper'>
                    <label>Fim da Polinização:</label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                </div>*/}
                <button className="settings-submit-btn" type="submit">Submeter</button>
            </form>
            <div>
                <h3>Culturas/Colmeias</h3>
               { isLoading ? "A inserir na base de dados" : <table className='settings-table'>
                    <thead>
                        <tr>
                            <th>Tipo de Cultura</th>
                            <th>Área</th>
                            <th>Colmeias Necessárias</th>
                           {/* <th>Início da Polinização</th>
                            <th>Fim da Polinização</th>*/}
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(entry => (
                            <tr key={entry._id}>
                                <td>{entry.cropType}</td>
                                <td>{entry.farmArea}</td>
                                <td>{entry.beehivesNeededPerHectare}</td>
                                {/* <td>{new Date(entry.pollinationStart).toLocaleDateString()}</td>
                                <td>{new Date(entry.pollinationEnd).toLocaleDateString()}</td>*/}
                                <td>
                                    <button className='settings-delete-btn' onClick={() => handleDelete(entry._id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>}
            </div>
        </div>
    );
};

export default SettingsPage;
