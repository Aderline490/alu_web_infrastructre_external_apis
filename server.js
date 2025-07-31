const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for portfolio (in production, use a database)
let portfolio = [];

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Helper function to fetch stock data from Alpha Vantage
async function fetchStockData(symbol) {
    try {
        const response = await fetch(
            `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        const data = await response.json();
        
        if (data['Error Message']) {
            throw new Error('Invalid stock symbol');
        }
        
        if (data['Note']) {
            throw new Error('API rate limit exceeded');
        }
        
        const quote = data['Global Quote'];
        if (!quote) {
            throw new Error('No data available for this symbol');
        }
        
        return {
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: quote['10. change percent'].replace('%', ''),
            previousClose: parseFloat(quote['08. previous close']),
            open: parseFloat(quote['02. open']),
            high: parseFloat(quote['03. high']),
            low: parseFloat(quote['04. low']),
            volume: parseInt(quote['06. volume']),
            latestTradingDay: quote['07. latest trading day']
        };
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get portfolio
app.get('/api/portfolio', (req, res) => {
    res.json(portfolio);
});

// Add stock to portfolio
app.post('/api/portfolio', async (req, res) => {
    try {
        const { symbol, shares } = req.body;
        
        if (!symbol || !shares || shares <= 0) {
            return res.status(400).json({ error: 'Valid symbol and shares required' });
        }
        
        // Check if stock already exists in portfolio
        const existingStock = portfolio.find(stock => stock.symbol.toLowerCase() === symbol.toLowerCase());
        
        if (existingStock) {
            return res.status(400).json({ error: 'Stock already in portfolio' });
        }
        
        // Fetch current stock data
        const stockData = await fetchStockData(symbol);
        
        const portfolioItem = {
            id: Date.now(),
            symbol: stockData.symbol,
            shares: parseFloat(shares),
            purchasePrice: stockData.price,
            currentPrice: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            totalValue: stockData.price * parseFloat(shares),
            gainLoss: 0,
            gainLossPercent: 0,
            addedAt: new Date().toISOString()
        };
        
        portfolio.push(portfolioItem);
        res.json(portfolioItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update portfolio with current prices
app.put('/api/portfolio/refresh', async (req, res) => {
    try {
        const updatedPortfolio = [];
        
        for (const stock of portfolio) {
            try {
                const stockData = await fetchStockData(stock.symbol);
                
                const gainLoss = (stockData.price - stock.purchasePrice) * stock.shares;
                const gainLossPercent = ((stockData.price - stock.purchasePrice) / stock.purchasePrice) * 100;
                
                const updatedStock = {
                    ...stock,
                    currentPrice: stockData.price,
                    change: stockData.change,
                    changePercent: stockData.changePercent,
                    totalValue: stockData.price * stock.shares,
                    gainLoss: gainLoss,
                    gainLossPercent: gainLossPercent
                };
                
                updatedPortfolio.push(updatedStock);
            } catch (error) {
                console.error(`Error updating ${stock.symbol}:`, error);
                updatedPortfolio.push(stock); // Keep old data if update fails
            }
        }
        
        portfolio = updatedPortfolio;
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove stock from portfolio
app.delete('/api/portfolio/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = portfolio.findIndex(stock => stock.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Stock not found' });
    }
    
    const removedStock = portfolio.splice(index, 1)[0];
    res.json(removedStock);
});

// Search for stock information
app.get('/api/search/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const stockData = await fetchStockData(symbol);
        res.json(stockData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Stock Portfolio Tracker running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the application`);
});