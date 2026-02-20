const cryptoContainer = document.getElementById('crypto-list');

async function fetchCryptoData() {
    try {
        // We define the specific IDs used by CoinGecko
        // litecoin, dogecoin, ripple (XRP), kucoin-shares (KCS)
        const coinIds = 'bitcoin,ethereum,litecoin,dogecoin,ripple,kucoin-shares';
        
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`);
        const data = await response.json();

        displayCoins(data);
    } catch (error) {
        console.error("Fetch error:", error);
        cryptoContainer.innerHTML = '<p>Error loading market data. Check your connection.</p>';
    }
}

function displayCoins(coins) {
    cryptoContainer.innerHTML = ''; // Clear loading text

    coins.forEach(coin => {
        const card = document.createElement('div');
        card.className = 'coin-card';

        card.innerHTML = `
            <img src="${coin.image}" alt="${coin.name}">
            <h3>${coin.name}</h3>
            <p class="price">$${coin.current_price.toLocaleString()}</p>
            <p style="color: ${coin.price_change_percentage_24h > 0 ? '#00ff00' : '#ff4d4d'}">
                ${coin.price_change_percentage_24h.toFixed(2)}%
            </p>
        `;
        cryptoContainer.appendChild(card);
    });
}

// Initial fetch
fetchCryptoData();
// Update every 30 seconds
setInterval(fetchCryptoData, 30000);

function calculateMining() {
    const hashrate = document.getElementById('hashrate').value;
    
    // Find Litecoin price from our fetched data
    const ltcData = allCoins.find(coin => coin.id === 'litecoin');
    const ltcPrice = ltcData ? ltcData.current_price : 0;

    // Simplified Mining Formula: (Hashrate * Efficiency Constant)
    // Note: In Module 9, you can explain how 'Difficulty' changes this.
    const ltcPerDay = (hashrate * 0.000015).toFixed(5); 
    const usdPerDay = (ltcPerDay * ltcPrice).toFixed(2);

    document.getElementById('daily-ltc').innerText = ltcPerDay;
    document.getElementById('daily-usd').innerText = `$${usdPerDay}`;
}

// Run once on load to show initial values
setTimeout(calculateMining, 2000);

async function fetchCryptoNews() {
    const newsContainer = document.getElementById('news-feed');
    
    try {
        // Using an open RSS-to-JSON converter to get CryptoPanic or CoinTelegraph headlines
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss');
        const data = await response.json();

        newsContainer.innerHTML = ''; // Clear loading

        data.items.slice(0, 10).forEach(item => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            
            // Format the date
            const date = new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            newsItem.innerHTML = `
                <a href="${item.link}" target="_blank">${item.title}</a>
                <span class="news-date">Published at ${date}</span>
            `;
            newsContainer.appendChild(newsItem);
        });
    } catch (error) {
        newsContainer.innerHTML = '<p>Unable to load news pulses. Market is quiet.</p>';
    }
}

// Update news every 5 minutes
fetchCryptoNews();
setInterval(fetchCryptoNews, 300000);

function createFallingCoin() {
    const coin = document.createElement('div');
    coin.innerHTML = '🪙';
    coin.style.position = 'fixed';
    coin.style.left = Math.random() * 100 + 'vw';
    coin.style.top = '-50px';
    coin.style.fontSize = Math.random() * 20 + 20 + 'px';
    coin.style.transition = 'transform 5s linear, opacity 5s';
    coin.style.zIndex = '9999';
    
    document.body.appendChild(coin);

    setTimeout(() => {
        coin.style.transform = `translateY(110vh) rotate(${Math.random() * 360}deg)`;
        coin.style.opacity = '0';
    }, 100);

    setTimeout(() => coin.remove(), 6000);
}

// Trigger every 3 seconds for a subtle effect
setInterval(createFallingCoin, 3000);

const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

window.addEventListener("mousemove", (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Update the center dot immediately
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // The outline follows with the CSS transition delay we set earlier
    cursorOutline.style.left = `${posX}px`;
    cursorOutline.style.top = `${posY}px`;
});

// Animation effect: shrink the cursor when clicking
window.addEventListener("mousedown", () => {
    cursorOutline.style.transform = "translate(-50%, -50%) scale(0.8)";
});
window.addEventListener("mouseup", () => {
    cursorOutline.style.transform = "translate(-50%, -50%) scale(1)";
});

function updateLiveStatus() {
    const statusText = document.getElementById('status-text');
    const now = new Date();
    const hour = now.getHours();

    // Example: Show online between 8 AM and 10 PM
    if (hour >= 8 && hour < 22) {
        statusText.innerText = "Nehemiah is currently ONLINE for consultations";
    } else {
        statusText.innerText = "Consultations are currently OFFLINE (Back at 8 AM)";
        document.querySelector('.status-dot').style.backgroundColor = "#ff4d4d";
        document.querySelector('.status-dot').style.animation = "none";
    }
}

updateLiveStatus();

async function updateTicker() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        const ticker = document.getElementById('live-ticker');
        ticker.innerHTML = ""; // Clear loader

        const coins = [
            { name: 'BTC', id: 'bitcoin' },
            { name: 'ETH', id: 'ethereum' },
            { name: 'LTC', id: 'litecoin' }
        ];

        // Duplicate the list so the scroll is seamless
        const content = coins.map(coin => {
            const price = data[coin.id].usd.toLocaleString();
            const change = data[coin.id].usd_24h_change.toFixed(2);
            const colorClass = change >= 0 ? 'price-up' : 'price-down';
            const arrow = change >= 0 ? '▲' : '▼';
            
            return `<div class="ticker-item">
                        ${coin.name}: $${price} 
                        <span class="${colorClass}">${arrow} ${change}%</span>
                    </div>`;
        }).join('');

        ticker.innerHTML = content + content; // Double it for infinite loop effect
    } catch (error) {
        console.error("Ticker Error:", error);
    }
}

// Update every 60 seconds
updateTicker();
setInterval(updateTicker, 60000);