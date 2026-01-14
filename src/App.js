import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Formulario from './components/Formulario';
import Juego from './components/Juego';
import Pokemon from './components/Pokemon';
import Cartas from './components/Cartas';

function App() {
  return (
    <Router>
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        {/* Menú de navegación vertical - AHORA OCUPA TODA LA ALTURA */}
        <nav className="flex-column p-3 bg-dark text-light" style={{ 
          minHeight: '100vh', 
          width: '200px',
          position: 'sticky',
          top: 0
        }}>
          <h3 className="text-primary mb-4">React Apps</h3>
          <div className="d-flex flex-column gap-2">
            <Link to="/" className="nav-link p-2 text-light text-decoration-none rounded hover-effect">🏠 Inicio</Link>
            <Link to="/formulario" className="nav-link p-2 text-light text-decoration-none rounded hover-effect">📝 Formulario</Link>
            <Link to="/juego" className="nav-link p-2 text-light text-decoration-none rounded hover-effect">🎮 Juego</Link>
            <Link to="/pokemon" className="nav-link p-2 text-light text-decoration-none rounded hover-effect">⚡ Pokémon</Link>
            <Link to="/cartas" className="nav-link p-2 text-light text-decoration-none rounded hover-effect">🃏 Cartas Pokémon</Link>
          </div>
          
          {/* Información adicional para llenar el espacio */}
          <div className="mt-auto pt-4" style={{ borderTop: '1px solid #444' }}>
            <small className="text-muted">Navegación React</small>
          </div>
        </nav>
        
        {/* Contenido principal */}
        <div className="p-4 flex-grow-1" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={
              <div className="text-center mt-5">
                <h1 className="display-4 text-primary">🚀 Bienvenido</h1>
                <p className="lead">Selecciona una opción del menú para comenzar</p>
                <div className="row mt-5">
                  <div className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">📝 Formulario</h5>
                        <p className="card-text">Formulario de contacto simple</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">🎮 Juego</h5>
                        <p className="card-text">Juego espacial con Phaser</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">⚡ Pokémon</h5>
                        <p className="card-text">Explora todos los Pokémon</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 offset-md-3 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">🃏 Cartas Pokémon</h5>
                        <p className="card-text">Juego de memoria con cartas Pokémon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/formulario" element={<Formulario />} />
            <Route path="/juego" element={<Juego />} />
            <Route path="/pokemon" element={<Pokemon />} />
            <Route path="/cartas" element={<Cartas />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;