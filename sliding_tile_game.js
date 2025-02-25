const gameContainer = document.getElementById('game-container');
const tileImages = [
    'bunny1.jpg', 'bunny2.jpg', 'bunny3.jpg',
    'bunny4.jpg', 'bunny5.jpg', 'bunny6.jpg',
    'bunny7.jpg', 'bunny8.jpg', 'bunny9.jpg'
];
let tiles = [];
let emptyTileIndex = 8;

function createTiles() {
    for (let i = 0; i < 9; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        if (i === emptyTileIndex) {
            tile.classList.add('empty');
        } else {
            tile.style.backgroundImage = `url(${tileImages[i]})`;
            tile.addEventListener('click', () => moveTile(i));
        }
        gameContainer.appendChild(tile);
        tiles.push(tile);
    }
}

function moveTile(index) {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyTileIndex / 3);
    const emptyCol = emptyTileIndex % 3;

    if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) || 
        (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
        tiles[index].classList.add('empty');
        tiles[index].style.backgroundImage = '';
        tiles[emptyTileIndex].classList.remove('empty');
        tiles[emptyTileIndex].style.backgroundImage = `url(${tileImages[index]})`;
        emptyTileIndex = index;
    }
}

function shuffleTiles() {
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        [tileImages[i], tileImages[j]] = [tileImages[j], tileImages[i]];
    }
    tiles.forEach((tile, index) => {
        if (index === emptyTileIndex) {
            tile.classList.add('empty');
            tile.style.backgroundImage = '';
        } else {
            tile.classList.remove('empty');
            tile.style.backgroundImage = `url(${tileImages[index]})`;
        }
    });
}

createTiles();
shuffleTiles();
