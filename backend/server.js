import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` ✨ Sonex Enterprises // Client Atelier API Server`);
  console.log(` 🚀 Listening at: http://localhost:${PORT}`);
  console.log(` 🩺 Health Check: http://localhost:${PORT}/health`);
  console.log(` 📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(` 🛍️ Orders API:   http://localhost:${PORT}/api/orders`);
  console.log(`====================================================`);
});
