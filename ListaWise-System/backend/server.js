require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ListaWise Backend API',
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`ListaWise backend server running on http://localhost:${port}`);
});
