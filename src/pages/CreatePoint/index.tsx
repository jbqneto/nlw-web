import React, { useEffect, useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import './createpoint.css';
import logo from '../../assets/logo.svg';
import api from '../../service/api';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedUf, setSelectedUf] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([-27.2092052, -49.6401092]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  });

  useEffect(() => {

    api.get('/items').then((response) => {
      setItems(response.data);
    }).catch((err) => {
      console.error(err);
    });

  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then((response) => {
      const ufs = response.data.map(uf => uf.sigla);

      setUfs(ufs.sort());
    }).catch((err) => {
      console.error(err);
    });
  }, []);

  useEffect(() => {
    if (selectedUf === '')
      return;

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/microrregioes?orderBy=nome`).then((response) => {
      const cityNames = response.data.map(city => city.nome);

      setCities(cityNames);

    }).catch((err) => {
      console.error(err);
    });

  }, [selectedUf]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;

    setSelectedUf(uf);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" className="logo" />
        <Link to="/">
          <FiArrowLeft>
            Voltar para a home
          </FiArrowLeft>
        </Link>
      </header>
      <main>
        <form>
          <h1>Cadastro do <br />ponto de coleta</h1>

          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input type="text" name="name" id="name" />
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input type="email" name="email" id="email" />
              </div>

              <div className="field">
                <label htmlFor="whatsapp">WhatsApp</label>
                <input type="text" name="whatsapp" id="whatsapp" />
              </div>
            </div>

          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </legend>

            <div className="map">
              <Map onClick={handleMapClick} center={initialPosition} zoom={15}>
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={selectedPosition}></Marker>
              </Map>
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select name="uf" id="uf"
                  value={selectedUf}
                  onChange={handleSelectUf} >

                  <option value="">Selecione uma UF</option>
                  {ufs.map((uf, index) => (
                    <option key={index} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="uf">Cidade</label>
                <select onChange={e => setSelectedCity(e.target.value)} value={selectedCity} name="city" id="city">
                  <option value="0">Selecione uma cidade</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </select>
              </div>

            </div>

          </fieldset>

          <fieldset>
            <legend>
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais itens abaixo</span>
            </legend>

            <ul className="items-grid">
              {items.map((item) => (
                <li key={item.id}>
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>

          </fieldset>
          <button type="submit">
            Cadastrar
           </button>
        </form>
      </main>
    </div >
  )
};

export default CreatePoint;