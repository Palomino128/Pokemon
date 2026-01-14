import React, { useState, useEffect } from 'react';
import './Cartas_style.css';

const Cartas = () => {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);
    const [selectedPokemons, setSelectedPokemons] = useState([]);
    const [gameTime, setGameTime] = useState(300); // 5 minutos en segundos
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [score, setScore] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState({
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#667eea'
    });

    // Lista de Pokémon populares y confiables
    const POPULAR_POKEMON_IDS = [
        1, 4, 7, 25, 133, 39, 52, 16, 19, 129,
        150, 151, 6, 9, 3, 94, 143, 131, 149, 130,
        26, 59, 65, 68, 76, 78, 80, 89, 91, 103,
        107, 113, 122, 124, 131, 134, 135, 136, 143, 144,
        145, 146, 150, 151, 249, 250, 251, 382, 383, 384
    ];

    // Función para obtener la mejor imagen disponible de un Pokémon
    const getPokemonImage = (pokemonData) => {
        return (
            pokemonData.sprites?.other?.dream_world?.front_default ||
            pokemonData.sprites?.other?.['official-artwork']?.front_default ||
            pokemonData.sprites?.other?.home?.front_default ||
            pokemonData.sprites?.front_default ||
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png'
        );
    };

    // Función para obtener detalles completos de un Pokémon por ID
    const fetchPokemonDetails = async (pokemonId) => {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            if (!response.ok) {
                throw new Error(`Pokémon ${pokemonId} no encontrado`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching Pokémon details:', error);
            return null;
        }
    };

    // Función para obtener Pokémon aleatorios de forma confiable
    const fetchRandomPokemons = async (count = 8) => {
        try {
            console.log("🎲 Seleccionando Pokémon aleatorios...");
            
            const shuffledIds = [...POPULAR_POKEMON_IDS]
                .sort(() => Math.random() - 0.5)
                .slice(0, count);

            console.log("IDs seleccionados:", shuffledIds);

            const pokemonPromises = shuffledIds.map(id => fetchPokemonDetails(id));
            const pokemonResults = await Promise.all(pokemonPromises);

            const successfulPokemons = pokemonResults
                .filter(pokemon => pokemon !== null)
                .map(pokemon => ({
                    name: pokemon.name,
                    image: getPokemonImage(pokemon),
                    id: pokemon.id
                }));

            console.log("✅ Pokémon cargados exitosamente:", successfulPokemons.map(p => p.name));

            // Si no hay suficientes Pokémon, agregar de respaldo
            if (successfulPokemons.length < count) {
                console.log("⚠️ No hay suficientes Pokémon, agregando de respaldo...");
                const backupPokemons = [
                    { name: "pikachu", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png", id: 25 },
                    { name: "bulbasaur", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png", id: 1 },
                    { name: "charmander", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png", id: 4 },
                    { name: "squirtle", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png", id: 7 },
                    { name: "eevee", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png", id: 133 },
                    { name: "jigglypuff", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png", id: 39 },
                    { name: "meowth", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png", id: 52 },
                    { name: "psyduck", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png", id: 54 }
                ];

                const needed = count - successfulPokemons.length;
                const additionalPokemons = backupPokemons
                    .slice(0, needed)
                    .filter(backup => !successfulPokemons.some(p => p.name === backup.name));

                successfulPokemons.push(...additionalPokemons);
            }

            return successfulPokemons.slice(0, count);
        } catch (error) {
            console.error('Error fetching random Pokémon:', error);
            
            // Pokémon de respaldo en caso de error
            const backupPokemons = [
                { name: "pikachu", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png", id: 25 },
                { name: "bulbasaur", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png", id: 1 },
                { name: "charmander", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png", id: 4 },
                { name: "squirtle", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png", id: 7 },
                { name: "eevee", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png", id: 133 },
                { name: "jigglypuff", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png", id: 39 },
                { name: "meowth", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png", id: 52 },
                { name: "psyduck", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png", id: 54 }
            ];

            return backupPokemons.slice(0, 8);
        }
    };

    // Timer del juego
    useEffect(() => {
        let interval;
        if (isTimerRunning && gameTime > 0) {
            interval = setInterval(() => {
                setGameTime(prevTime => {
                    if (prevTime <= 1) {
                        setIsTimerRunning(false);
                        setGameCompleted(true);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, gameTime]);

    // Cargar juego guardado del localStorage al iniciar
    useEffect(() => {
        const savedGame = localStorage.getItem('pokemonMemoryGame');
        if (savedGame) {
            try {
                const gameData = JSON.parse(savedGame);
                if (gameData && Date.now() - new Date(gameData.lastSaved).getTime() < 24 * 60 * 60 * 1000) {
                    setCards(gameData.cards || []);
                    setMatchedCards(gameData.matchedCards || []);
                    setMoves(gameData.moves || 0);
                    setGameTime(gameData.gameTime || 300);
                    setScore(gameData.score || 0);
                    setSelectedPokemons(gameData.selectedPokemons || []);
                    setGameStarted(true);
                    
                    if (gameData.matchedCards.length < gameData.cards.length && gameData.gameTime > 0) {
                        setIsTimerRunning(true);
                    } else {
                        setGameCompleted(true);
                    }
                    console.log("💾 Juego cargado desde localStorage");
                    return;
                }
            } catch (error) {
                console.error("Error cargando juego guardado:", error);
            }
        }
        
        // Si no hay juego guardado, cargar nuevo juego
        loadRandomPokemons();
    }, []);

    // Guardar datos en localStorage cuando cambien
    useEffect(() => {
        if (gameStarted && cards.length > 0) {
            const gameData = {
                cards,
                matchedCards,
                moves,
                gameTime,
                score,
                selectedPokemons,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('pokemonMemoryGame', JSON.stringify(gameData));
        }
    }, [cards, matchedCards, moves, gameTime, score, selectedPokemons, gameStarted]);

    // Función para limpiar TODOS los datos del localStorage
    const cleanAllGameData = () => {
        console.log("🧹 Limpiando TODOS los datos del juego...");
        
        // Eliminar todas las claves relacionadas con el juego
        localStorage.removeItem('pokemonMemoryGame');
        localStorage.removeItem('selectedPokemons');
        localStorage.removeItem('matchedCards');
        localStorage.removeItem('gameProgress');
        localStorage.removeItem('currentGame');
        localStorage.removeItem('pokemonMemoryScore');
        
        console.log("✅ TODOS los datos eliminados del localStorage");
    };

    // Cargar Pokémon aleatorios automáticamente
    const loadRandomPokemons = async () => {
        setLoadingImages(true);
        
        try {
            // PRIMERO limpiar todos los datos anteriores
            cleanAllGameData();
            
            // Resetear todo el estado a cero
            setScore(0);
            setMoves(0);
            setGameTime(300);
            setFlippedCards([]);
            setMatchedCards([]);
            setGameCompleted(false);
            
            const randomPokemons = await fetchRandomPokemons(8);
            
            if (randomPokemons.length > 0) {
                console.log("🎯 Pokémon finales para el juego:", randomPokemons.map(p => p.name));
                setSelectedPokemons(randomPokemons);
                setCards(generateCards(randomPokemons));
                setGameStarted(true);
                
                // Iniciar timer
                setIsTimerRunning(true);
                
                // Cambiar tema aleatorio
                setCurrentTheme(getRandomPokemonTheme());
            } else {
                console.error("❌ No se pudieron cargar Pokémon");
                alert('Error al cargar Pokémon. Intenta recargar la página.');
            }
        } catch (error) {
            console.error('Error loading random Pokémon:', error);
            alert('Error de conexión. Verifica tu internet y recarga la página.');
        } finally {
            setLoadingImages(false);
        }
    };

    // Generar las cartas duplicadas y barajadas
    const generateCards = (pokemons) => {
        const shuffledPokemons = [...pokemons, ...pokemons]
            .map((pokemon, index) => ({
                ...pokemon,
                uniqueId: `${pokemon.id}-${index}`,
                flipped: false,
                matched: false
            }))
            .sort(() => Math.random() - 0.5);

        console.log("🃏 Cartas generadas:", shuffledPokemons.length);
        return shuffledPokemons;
    };

    // Calcular puntos cuando se encuentra un par
    const calculatePairScore = () => {
        const basePoints = 2; // 2 puntos base por encontrar un par (como solicita el ejercicio)
        const timeBonus = Math.max(0, 5 - Math.floor(gameTime / 60)); // Bonus por tiempo
        const movesBonus = Math.max(0, 3 - Math.floor(moves / 10)); // Bonus por eficiencia
        
        const pairScore = basePoints + timeBonus + movesBonus;
        console.log(`🎯 Par encontrado! +${pairScore} puntos (base:${basePoints} + tiempo:${timeBonus} + movimientos:${movesBonus})`);
        
        return pairScore;
    };

    const handleCardClick = (clickedCard) => {
        if (flippedCards.length === 2 || 
            clickedCard.flipped || 
            clickedCard.matched ||
            !isTimerRunning ||
            gameCompleted) {
            return;
        }

        const updatedCards = cards.map(card =>
            card.uniqueId === clickedCard.uniqueId ? { ...card, flipped: true } : card
        );
        setCards(updatedCards);

        const newFlippedCards = [...flippedCards, clickedCard];
        setFlippedCards(newFlippedCards);

        if (newFlippedCards.length === 2) {
            setMoves(moves + 1);
            const [firstCard, secondCard] = newFlippedCards;

            if (firstCard.name === secondCard.name) {
                // PAR ENCONTRADO - Sumar puntos inmediatamente
                const pairScore = calculatePairScore();
                setScore(prevScore => prevScore + pairScore);

                setTimeout(() => {
                    const matchedUpdatedCards = updatedCards.map(card =>
                        card.name === firstCard.name ? { ...card, matched: true } : card
                    );
                    setCards(matchedUpdatedCards);
                    const newMatchedCards = [...matchedCards, firstCard, secondCard];
                    setMatchedCards(newMatchedCards);
                    setFlippedCards([]);

                    // Verificar si el juego está completo
                    if (newMatchedCards.length === cards.length) {
                        setIsTimerRunning(false);
                        setGameCompleted(true);
                        // Bonus por completar el juego
                        const completionBonus = 10;
                        setScore(prevScore => prevScore + completionBonus);
                        console.log(`🏆 Juego completado! Bonus de completación: +${completionBonus} puntos`);
                    }
                }, 500);
            } else {
                setTimeout(() => {
                    const resetCards = updatedCards.map(card =>
                        newFlippedCards.some(flipped => flipped.uniqueId === card.uniqueId) && !card.matched
                            ? { ...card, flipped: false } 
                            : card
                    );
                    setCards(resetCards);
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    const resetGame = async () => {
        setLoadingImages(true);
        
        try {
            console.log("🔄 Reiniciando juego COMPLETO...");
            const newRandomPokemons = await fetchRandomPokemons(8);
            
            if (newRandomPokemons.length > 0) {
                console.log("✅ Nuevos Pokémon:", newRandomPokemons.map(p => p.name));
                
                // LIMPIAR TODO completamente
                cleanAllGameData();
                
                // Resetear todo el estado
                setSelectedPokemons(newRandomPokemons);
                setCards(generateCards(newRandomPokemons));
                setFlippedCards([]);
                setMatchedCards([]);
                setMoves(0);
                setGameTime(300);
                setScore(0); // Resetear puntuación a 0
                setIsTimerRunning(true);
                setGameCompleted(false);
                setCurrentTheme(getRandomPokemonTheme());
                
                console.log("🎮 Juego reiniciado completamente - Puntuación: 0");
            }
        } catch (error) {
            console.error('Error resetting game:', error);
            alert('Error al reiniciar. Intenta de nuevo.');
        } finally {
            setLoadingImages(false);
        }
    };

    // Formatear tiempo en minutos y segundos
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getRandomPokemonTheme = () => {
        const themes = [
            { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
            { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#f5576c' },
            { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#4facfe' },
            { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#43e97b' },
            { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#fa709a' },
            { background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#a8edea' },
            { background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', color: '#d299c2' },
            { background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', color: '#89f7fe' }
        ];
        return themes[Math.floor(Math.random() * themes.length)];
    };

    const renderCard = (card) => {
        const isFlipped = card.flipped || card.matched;
        
        return (
            <div
                key={card.uniqueId}
                className={`card ${isFlipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
                onClick={() => handleCardClick(card)}
            >
                <div className="card-inner">
                    <div className="card-front">
                        <div className="pokeball-icon">
                            <div className="pokeball-top"></div>
                            <div className="pokeball-center"></div>
                            <div className="pokeball-bottom"></div>
                        </div>
                        <span className="card-number">?</span>
                    </div>
                    <div className="card-back">
                        <img 
                            src={card.image} 
                            alt={card.name}
                            className="carta-pokemon-image"
                            onError={(e) => {
                                console.log(`Error cargando imagen de ${card.name}, usando respaldo`);
                                e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png';
                            }}
                        />
                        <p className="carta-pokemon-name">{card.name}</p>
                    </div>
                </div>
            </div>
        );
    };

    if (!gameStarted || loadingImages) {
        return (
            <div className="cartas-container" style={{ background: currentTheme.background }}>
                <div className="loading-message">
                    <h2>🎮 Juego de Cartas Pokémon</h2>
                    <p>{loadingImages ? '🎲 Buscando Pokémon aleatorios...' : 'Preparando el juego...'}</p>
                    <div className="pokeball-loading"></div>
                    {loadingImages && (
                        <div className="loading-details">
                            <p className="loading-subtext">Conectando con el mundo Pokémon...</p>
                            <div className="loading-animation">
                                <div className="pokemon-hunt">🔍</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="cartas-container" style={{ background: currentTheme.background }}>
            <div className="game-header">
                <h1>🎮 Encuentra los Pares Pokémon</h1>
                <p><strong>⏱️ Temporizador: 5 minutos • 💰 2 puntos por par encontrado</strong></p>
                
                <div className="pokemon-list-preview">
                    <h4>Pokémon en este juego:</h4>
                    <div className="pokemon-tags">
                        {selectedPokemons.map((pokemon, index) => (
                            <span key={index} className="pokemon-tag">
                                {pokemon.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="game-stats">
                    <div className="stat">
                        <span className="stat-label">⏱️ Tiempo:</span>
                        <span className="stat-value">{formatTime(gameTime)}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">🎯 Movimientos:</span>
                        <span className="stat-value">{moves}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">✅ Pares:</span>
                        <span className="stat-value">{matchedCards.length / 2} / {selectedPokemons.length}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">⭐ Puntuación:</span>
                        <span className="stat-value">{score}</span>
                    </div>
                </div>

                <button className="reset-button" onClick={resetGame}>
                    🎲 Nuevo Juego
                </button>
            </div>

            <div className="cards-grid">
                {cards.map(card => renderCard(card))}
            </div>

            {(gameCompleted || gameTime === 0) && (
                <div className="victory-message">
                    <div className="victory-content">
                        <h2>{gameTime === 0 ? '⏰ ¡Tiempo Agotado!' : '🎉 ¡Felicidades!'}</h2>
                        <p className="victory-stats">
                            ⭐ Puntuación Final: <strong>{score}</strong><br />
                            ✅ Pares Encontrados: <strong>{matchedCards.length / 2}</strong><br />
                            🎯 Movimientos Totales: <strong>{moves}</strong><br />
                            ⏱️ Tiempo {gameTime === 0 ? 'Utilizado' : 'Restante'}: <strong>{formatTime(gameTime)}</strong>
                        </p>
                        <p className="victory-details">
                            {gameTime === 0 
                                ? 'El tiempo de 5 minutos ha terminado. ¡Inténtalo de nuevo!'
                                : `¡Has encontrado todos los ${selectedPokemons.length} pares Pokémon!`}
                            <br />
                            <strong>💰 Puntuación basada en 2 puntos por par + bonificaciones</strong>
                        </p>
                        <button className="play-again-button" onClick={resetGame}>
                            🎮 Jugar Otra Vez
                        </button>
                    </div>
                </div>
            )}

            <div className="game-instructions">
                <h3>🎯 ¡Juego de Memoria Pokémon con LocalStorage!</h3>
                <ul>
                    <li>⏱️ <strong>Temporizador de 5 minutos</strong> - El juego termina cuando se acaba el tiempo</li>
                    <li>💰 <strong>2 puntos por cada par encontrado</strong> - Como solicita el ejercicio</li>
                    <li>💾 <strong>LocalStorage activado</strong> - Tu progreso se guarda automáticamente</li>
                    <li>⭐ <strong>Bonificaciones extra</strong> - Por tiempo restante y eficiencia</li>
                    <li>🎲 <strong>Pokémon aleatorios</strong> - 8 Pokémon diferentes en cada juego</li>
                    <li>🔄 <strong>Reinicio completo</strong> - Nuevos Pokémon cada vez</li>
                    <li>💡 <strong>Progreso guardado</strong> - Puedes continuar donde lo dejaste</li>
                </ul>
                <div className="fun-fact">
                    <strong>💡 Dato curioso:</strong> ¡Encuentra los pares rápidamente para maximizar tu puntuación con las bonificaciones por tiempo!
                </div>
            </div>
        </div>
    );
};

export default Cartas;