const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const chalk = require('chalk')
const express = require('express')
const ExcelJS = require('exceljs')
const moment = require('moment')
const ora = require('ora')
const cors = require('cors')
const {send} = require('process')
const app = express();
var bodyParser = require('body-parser')

const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

app.use(cors())
 
app.use(express.urlencoded({ extended: true}));

const sendWithApiT = (req, res) => {
  //  res.json(req.body)
    const { message,to }  = req.body;
    const newNumber = `${to}@c.us`
   // const caminho = `${midia}`
    const mensagem= `${message}`
    console.log(message, to);
   
    
   // sendMedia(newNumber, caminho)
  
    sendMessage(newNumber, mensagem)

    res.send({status: 'Enviado'})
}

const sendWithApiF = (req, res) => {
  //  res.json(req.body)
    const { message,to }  = req.body;
    const newNumber = `${to}@c.us`
    const caminho = `${message}`
    console.log(message, to);
   
    
    sendMedia(newNumber, caminho)

    res.send({status: 'Enviado'})
}

const sendWithApiTF = (req, res) => {
    //  res.json(req.body)
      const { midia,message,to }  = req.body;
      const newNumber = `${to}@c.us`
      const caminho = `${midia}`
      const mensagem = `${message}`
      console.log(message, to);
     
      
      sendMediaFile(newNumber, caminho, mensagem)
  
      res.send({status: 'Enviado'})
  }
  

app.post('/sendT',sendWithApiT)

app.post('/sendF',sendWithApiF)

app.post('/sendTF',sendWithApiTF)

const whithSession = () =>  {
  //se existe sessão carregamos o arquivo edenciais
  const spinner = ora(`carregando ${chalk.yellow('Validando sessão com whatss')}`);
  sessionData = require(SESSION_FILE_PATH);
  spinner.start();

  client = new Client({
      session: sessionData
  })

  client.on('ready', () => {
     console.log('Cliente is ready!')
      spinner.stop();
      listenMessage();
  });

  client.on('auth_failure',() =>{
      spinner.stop();
     console.log('erro na autenticação ao gerar qrcode');
  })
  client.initialize();
}



/** essa seção gera qrcode */
const withOutSession = ()  => {
    
console.log(' não tem seção salva');
client = new Client();
client.on('qr', qr => {
    qrcode.generate(qr,{ small: true});
});
    client.on('authenticated',(session) => {
        // guarda credenciais
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session),function(err){
            if (err) {
                console.log(err);
            }
        });
    });
    client.initialize();
}

/**
 * esta função escuta as mensagens novas
 */
const removeEspaco= ()  =>{
    const st = body.replace(/\s/g, ''); 
    console.log(st);
    return st;
}

const listenMessage = () => {
    client.on('message',(msg) => {
        const{from, to, body} = msg;   
        
           //removendo espaços
         const st = body.replace(/\s/g, '');
         const saud = '\n suporte HDS , já iremos atendê-lo ';

            switch (0){ 
 		   case st.search(/bomdia/i):  
                     sendMessage(from, 'Bom Dia! ' + saud)
                   break;
 		   case st.search(/boatarde/i):  
                     sendMessage(from, 'Boa Tarde! ' + saud)
                   break;
                    case st.search(/boanoite/i):  
                     sendMessage(from, 'Boa Noite! ' + saud)
                   break;
                   case (st.search(/obrigado/i)):
                     sendMessage(from,  'Imagina! precisando estamos a disposição')
                   break;
	           case (st.search(/midia/i)):
                    sendMessage(from,  'Midiaa! precisando estamos a disposição'); 
                     sendMedia(from, "\orcamento de venda.pdf");
                   break;
             }

            saveHistorico(from, body)

            console.log(`${chalk.yellow(body)}`);      
    })
}

const sendMedia = (to, file) => {
  const mediaFile = MessageMedia.fromFilePath(`${file}`);
  client.sendMessage(to, mediaFile)
}

const sendMessage = (to, message) => {
    client.sendMessage(to,message)
}

const sendMediaFile = (to, file, men) => {
    const mediaFile = MessageMedia.fromFilePath(`${file}`);
    mediaFile.filename
    
    console.log("--- menn---+"+men);
    client.sendMessage(to,mediaFile);
    client.sendMessage(to,men)
  }
  
const saveHistorico = (number, message) => {
    const pathChat = `./chats/${number}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    const today = moment().format('DD-MM-YYYY hh:mm');
    if (fs.existsSync(pathChat)) {
        workbook.xlsx.readFile(pathChat)
        .then(() => {
              const worksheet = workbook.getWorksheet(1);
              const lastRow = worksheet.lastRow; 
              let getRowInsert = worksheet.getRow(++(lastRow.number))
              getRowInsert.getCell('A').value = today;
              getRowInsert.getCell('B').value = message;
              getRowInsert.commit();
              workbook.xlsx.writeFile(pathChat)
              .then(() => {
                  console.log('chat alterado!');
              })
              .catch(() => {
                  console.log('erro ao alterar chat');
              })
              
        })
    }else {
        //criamos
        console.log('criando');
        const worksheet  = workbook.addWorksheet('Chats');
        worksheet.columns = [
            {header: 'Data Mensagem', key: 'date'},
            {header: 'Mensagem', key: 'message'},   
        ]
        worksheet.addRow([today, message])
        workbook.xlsx.writeFile(pathChat)
        .then(() => {
            console.log('Histórico criado');
        })
        .catch(() => {
            console.log('falha ao criar histórico');
        }) 
    }
}



(fs.existsSync(SESSION_FILE_PATH)) ? whithSession() : withOutSession();


app.listen(9000,() => {
    console.log('API está iniciada!');
})