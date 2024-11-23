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
  const screenshotBase64 = await takeScreenshot(body);

  console.log("come")
  if (screenshotBase64) {
    return res.json({ message: 'Screenshot takens', data: screenshotBase64 });
  } else {
    return res.status(500).json({ message: 'Failed to capture screenshot' });
  }
})

app.listen(6000, () => {
  console.log('Server is running on port 6000');
});