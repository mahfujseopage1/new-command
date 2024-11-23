import express from 'express';
import cors from 'cors';
import { takeScreenshot } from './takeScreenshot.mjs';


const app = express();



app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Command Server Is running', status: 200 });
});


app.post('/take-screenshot', async (req, res) => {
  const body = req.body
  const data = await takeScreenshot(body);
  console.log(data)
  res.json({ message: 'Screenshot taken', status: 200, data: data });
})

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});