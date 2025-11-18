import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // ESTADOS
  const [shows, setShows] = useState([]) // Lista completa de series de la API
  const [filteredShows, setFilteredShows] = useState([]) // Lista filtrada para mostrar
  const [search, setSearch] = useState("") // Texto del buscador
  const [favorites, setFavorites] = useState([]) // Lista de favoritos
  const [selectedShow, setSelectedShow] = useState(null) // Serie seleccionada para el modal
  const [genreFilter, setGenreFilter] = useState("") // Extra: Filtro género
  const [sortByRating, setSortByRating] = useState(false) // Extra: Ordenación

  //  Cargar datos de la API y LocalStorage al inicio
  useEffect(() => {
    // Petición HTTP
    fetch('https://api.tvmaze.com/shows')
      .then(response => response.json())
      .then(data => {
        setShows(data)
        setFilteredShows(data)
      })
      .catch(error => console.error("Error cargando series:", error))

    // Recuperar favoritos del LocalStorage
    const storedFavs = JSON.parse(localStorage.getItem('myFavorites'))
    if (storedFavs) {
      setFavorites(storedFavs)
    }
  }, [])

  // EFECTO 2: Filtrar y Ordenar cada vez que cambia la búsqueda, el género o el sort
  useEffect(() => {
    let result = shows

    // 1. Filtrar por nombre 
    if (search) {
      result = result.filter(show => 
        show.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 2. Filtrar por género
    if (genreFilter) {
      result = result.filter(show => show.genres.includes(genreFilter))
    }

    // 3.  Ordenar por rating 
    if (sortByRating) {
      result = [...result].sort((a, b) => b.rating.average - a.rating.average)
    }

    setFilteredShows(result)
  }, [search, shows, genreFilter, sortByRating])

  // Guardar en LocalStorage
  useEffect(() => {
    localStorage.setItem('myFavorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (show) => {
    // Comprobar si ya existe 
    const isFav = favorites.find(fav => fav.id === show.id)
    
    if (isFav) {
      // Quitar de favoritos (filter)
      setFavorites(favorites.filter(fav => fav.id !== show.id))
    } else {
      // Añadir a favoritos 
      setFavorites([...favorites, show])
    }
  }

  // Obtener detalle 
  const handleShowDetail = async (show) => {
    // Aunque ya tenemos datos, hacemos la llamada extra como pide el enunciado para practicar fetch async/await
    try {
      const response = await fetch(`https://api.tvmaze.com/shows/${show.id}`)
      const data = await response.json()
      setSelectedShow(data)
    } catch (error) {
      console.error("Error en detalle:", error)
      // Si falla, usamos los datos que ya teníamos
      setSelectedShow(show) 
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1>📺 TV Series Finder</h1>
        
        <div className="controls">
          <input 
            type="text" 
            placeholder="Buscar serie..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
          <select onChange={(e) => setGenreFilter(e.target.value)}>
            <option value="">Todos los géneros</option>
            <option value="Drama">Drama</option>
            <option value="Science-Fiction">Ciencia Ficción</option>
            <option value="Comedy">Comedia</option>
            <option value="Action">Acción</option>
          </select>

          <label>
            <input 
              type="checkbox" 
              checked={sortByRating}
              onChange={(e) => setSortByRating(e.target.checked)}
            />
            Ordenar por Rating ⭐
          </label>
        </div>
      </header>

      <main>
        {favorites.length > 0 && (
          <section className="favorites-section">
            <h2>Mis Favoritos ❤️</h2>
            <div className="grid">
              {favorites.map(show => (
                <div key={show.id} className="card fav-card">
                  <img src={show.image?.medium} alt={show.name} />
                  <h4>{show.name}</h4>
                  <button onClick={() => toggleFavorite(show)}>Quitar ❌</button>
                </div>
              ))}
            </div>
          </section>
        )}
        <section>
          <h2>Resultados</h2>
          <div className="grid">
            {filteredShows.map(show => (
              <div key={show.id} className="card">
                <img 
                  src={show.image?.medium || "https://via.placeholder.com/210x295"} 
                  alt={show.name} 
                  onClick={() => handleShowDetail(show)} // Click para ver detalle
                  style={{cursor: 'pointer'}}
                />
                <h3>{show.name}</h3>
                <p>⭐ {show.rating?.average || "N/A"}</p>
                
                {/* Botón favorito dinámico */}
                <button onClick={() => toggleFavorite(show)}>
                  {favorites.some(fav => fav.id === show.id) ? "Quitar ❤️" : "Añadir 🤍"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODAL (Renderizado condicional simple) */}
      {selectedShow && (
        <div className="modal-overlay" onClick={() => setSelectedShow(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedShow(null)}>Cerrar</button>
            <h2>{selectedShow.name}</h2>
            <div className="modal-body">
              <img src={selectedShow.image?.original} alt={selectedShow.name} />
              <div>
                <p><strong>Géneros:</strong> {selectedShow.genres.join(", ")}</p>
                <p><strong>Idioma:</strong> {selectedShow.language}</p>
                <p><strong>Estreno:</strong> {selectedShow.premiered}</p>
                {/* innerHTML es peligroso pero se enseña */}
                <div dangerouslySetInnerHTML={{ __html: selectedShow.summary }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
