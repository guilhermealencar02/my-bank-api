import express from 'express';
import {
  accountModel
} from '../models/account.js';

const app = express();

app.get('/account', async (req, res) => {
  try {
    const account = await accountModel.find({});
    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/account', async (req, res) => {
  try {
    const account = new accountModel(req.body);
   // console.log(account);
    await account.save();

    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/account/:id', async (req, res) => {
  try {
    const account = await accountModel.findOneAndDelete({
      '_id': req.params.id
    });
    if (!account) {
      res.status(404).send("Documento não encontrado na coleção");
    }
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/account', async (req, res) => {
  try {
    const account = await accountModel.findOne(
       { agencia:req.body.agencia, conta:req.body.conta }
    );
    if(account){
      account.balance -= req.body.value;
      const accountUpdate = await accountModel.findOneAndUpdate({
        _id: account._id
      }, {
        balance : account.balance
      }, {
        new: true
      });
      res.send(accountUpdate);
    }else{
      res.status(400).send("Conta inválida");
    }

  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/account/:id', async (req, res) => {
  try {
    const account = await accountModel.findOneAndUpdate({
      _id: req.params.id
    }, req.body, {
      new: true
    });
    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/transfer', async (req, res) => {
  try {
    const accountOrigem = await accountModel.findOne(
       { conta:req.body.contaOrigem }
    );
    const accountDestino = await accountModel.findOne(
      { conta:req.body.contaDestino }
   );
   
    if(accountOrigem.agencia === accountDestino.agencia){
      accountOrigem.balance -= req.body.valueTranser;
      accountDestino.balance += req.body.valueTranser;
      const accountOrigemUpdate = await accountModel.findOneAndUpdate({
        _id: accountOrigem._id
      }, {
        balance :  accountOrigem.balance
      }, {
        new: true
      });
      const accountDestinoUpdate = await accountModel.findOneAndUpdate({
        _id: accountDestino._id
      }, {
        balance : accountDestino.balance
      }, {
        new: true
      });
      res.send(accountOrigemUpdate+accountDestinoUpdate);
    }else{
      accountOrigem.balance -= (req.body.valueTranser - 8);
      accountDestino.balance += req.body.valueTranser;
      const accountOrigemUpdate = await accountModel.findOneAndUpdate({
        _id: accountOrigem._id
      }, {
        balance :  accountOrigem.balance
      }, {
        new: true
      });
      const accountDestinoUpdate = await accountModel.findOneAndUpdate({
        _id: accountDestino._id
      }, {
        balance : accountDestino.balance
      }, {
        new: true
      });
      res.send("Origem: "+ accountOrigemUpdate+ "Destino: "+accountDestinoUpdate);
    }

  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/media', async (req, res) => {
  try {
    const account = await accountModel.find(
       { agencia:req.body.agencia }
    );
    const count = await accountModel.find(
      { agencia:req.body.agencia }
   ).count();
    var sum = 0;
    for await (const doc of account) {
      sum += doc.balance;
    }
    var result = (sum/count).toFixed(2);
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/menor', async (req, res) => {
  try {
    //const account = await accountModel.find().sort({balance: 'descending' }).limit(req.body.limit);
    const account = await accountModel.find().sort({balance : 'ascending' }).limit(req.body.limit);

    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/agencia', async (req, res) => {
  try {
    var result = [];
    const account = await accountModel.distinct('agencia');
    for await (const doc of account) {
       result += await accountModel.find({ agencia : doc }).sort({balance: 'descending' }).limit(req.body.limit)
    }

    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

export {
  app as accountRouter
};