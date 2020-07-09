import express from 'express';
import mongoose from 'mongoose';
import {
  accountRouter
} from './routes/accountRouter.js';

(async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://yourDB:<password>@yourCluster.tl3sv.mongodb.net/yourCollection?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
  } catch (error) {
    console.log("Erro ao conectar no MongoDB");
  }
})();

const app = express();
app.use(express.json());
app.use(accountRouter);

app.listen(5000, () => console.log("Servidor em Execução"));