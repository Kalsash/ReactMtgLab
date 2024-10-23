import './App.css';
import ColorStats from './ColorStats';
import ManaCostStats from './ManaCostStats';
import { Mtg } from './services/mtg';
import { useState, useEffect } from 'react';

const App = () => {
  const [deck, setDeck] = useState({});
  const [colorData, setColorData] = useState([
    { color: "NoColor", count: 0 },
    { color: "W", count: 0 },
    { color: "U", count: 0 },
    { color: "G", count: 0 },
    { color: "R", count: 0 },
    { color: "B", count: 0 }
  ]);

  const [manaData, setManaData] = useState([
    { cost: "0", count: 0 },
    { cost: "1", count: 0 },
    { cost: "2", count: 0 },
    { cost: "3", count: 0 },
    { cost: "4", count: 0 },
    { cost: "5", count: 0 },
    { cost: "6", count: 0 },
    { cost: '7+', count: 0 }
  ]);

  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  
  const mtg = new Mtg();

  const updateStats = () => {
    const newColorData = [...colorData];
    const newManaData = [...manaData];

    for (const card of Object.values(deck)) {
      // Update color data
      (card.colors || []).forEach(color => {
        const colorIndex = newColorData.findIndex(item => item.color === color);
        if (colorIndex !== -1) {
          newColorData[colorIndex].count += card.count;
        }
      });
      if (!card.colors) {
        newColorData[0].count += card.count; // NoColor
      }

      // Update mana data
      if (card.manaCost) {
        const manaCost = parseInt(card.manaCost, 10);
        if (!isNaN(manaCost)) {
          if (manaCost < 7) {
            newManaData[manaCost].count += card.count;
          } else {
            newManaData[newManaData.length - 1].count += card.count; // 7+
          }
        }
      }
    }

    setColorData(newColorData);
    setManaData(newManaData);
  };

  useEffect(() => {
    updateStats();
  }, [deck]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    mtg.loadCards(event.target.value)
      .then(fetchedCards => setCards(fetchedCards))
      .catch(error => {
        console.error('Error loading cards:', error);
      });
  };

  const handleCardClick = (card) => {
    setSelectedCard(card); // Устанавливаем текущую выбранную карту
  };

  const addToDeck = () => {
    if (selectedCard) {
      const card = selectedCard; // Получаем выбранную карту

      const isUnique = card.rarity === "Mythic Rare" || card.rarity === "Rare";
      const existingCount = deck[card.name] ? deck[card.name].count : 0;

      if (isUnique && existingCount >= 1) {
        alert(`You have already added a unique card "${card.name}" `);
        return;
      } 
      if (!isUnique && existingCount >= 4) {
        alert(`You cannot add more than 4 copies of the card "${card.name}".`);
        return;
      }

      setDeck(prevDeck => {
        const newDeck = { ...prevDeck };
        if (newDeck[card.name]) {
          newDeck[card.name].count += 1;
        } else {
          newDeck[card.name] = { ...card, count: 1 };
        }

        // Update color data
        (card.colors || []).forEach(color => {
          const colorIndex = colorData.findIndex(item => item.color === color);
          if (colorIndex !== -1) {
            colorData[colorIndex].count += 1;
          } else {
            colorData.push({ color, count: 1 });
          }
        });

        if (!card.colors) {
          colorData[0].count++;
        }

        // Update mana data
        if (card.cmc >= 7) {
          manaData[7].count++;
        } else {
          manaData[card.cmc].count++;
        }

        updateStats(); // Обновляем статистику
        
        return newDeck;
      });
      setSelectedCard(null); // Сбрасываем выбранную карту
    }
  };

  const removeFromDeck = (cardKey) => {
    setDeck(prevDeck => {
      const newDeck = { ...prevDeck };
      if (newDeck[cardKey]) {
        const card = newDeck[cardKey];
        card.colors.forEach(color => {
          const colorIndex = colorData.findIndex(item => item.color === color);
          if (colorIndex !== -1) {
            colorData[colorIndex].count--;
          }
        });
        if (card.cmc >= 7) {
          manaData[7].count--;
        } else {
          manaData[card.cmc].count--;
        }

        newDeck[cardKey].count -= 1;

        if (newDeck[cardKey].count <= 0) {
          delete newDeck[cardKey];
        }

        updateStats();
      }
      return newDeck;
    });
  };

  return (
    <div>
      <header>
        <h1>MTG Deck Builder</h1>
      </header>
      <main className="main">
        <div id="menu">
          <h2>Cards</h2>
          <input
            type="text"
            id="searchInput"
            placeholder="Type name of your card"
            value={searchTerm}
            onChange={handleSearch}
          />
          <div id="listContainer">
            <ul>
              {cards.map(card => (
                <li key={card.name} onClick={() => handleCardClick(card)}>
                  {card.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="content">
          <div id="cardsContainer">
            <h1 style={{ display: "flex", justifyContent: "center" }}>
              List Of Cards
            </h1>

            {selectedCard && (
              <div>
                <img src={selectedCard.imageUrl} alt={selectedCard.name} />
                <p>{selectedCard.text || 'No description'}</p>
                <p>Color: {selectedCard.colors ? selectedCard.colors.join(", ") : "No color"}</p>
                <p>Rarity: {selectedCard.rarity}</p>
                <p>Mana Cost: {selectedCard.cmc}</p>
                <button onClick={addToDeck}>Add to Deck</button>
              </div>
            )}

            {Object.entries(deck).map(([cardKey, card]) => (
              <div className="deck-card" key={cardKey}>
                <img src={card.imageUrl} alt={card.name} />
                <span>x{card.count}</span>
                <button onClick={() => removeFromDeck(cardKey)}>Delete</button>
              </div>
            ))}
          </div>
        </div>

        <div id="stats">
          <h2>Stats</h2>
          <div className="widgets">
            <div id="manaStats">
              <ManaCostStats data={manaData} />
            </div>
            <div id="colorStats">
              <ColorStats data={colorData} />
            </div>
          </div>
        </div>
      </main>
      <footer></footer>
    </div>
  );
};

export default App;