
	var util 	= require('util'),
		fs		= require('fs'),
		sio 	= require('socket.io'),
		server 	= require('http').createServer(handler);

	server.listen(8000);
	
	function handler(request, response) {
		
		// readFile 	= lendo algum arquivo
		//__dirname 	= endereço do arquivo
		// /index.html 	= nome do arquivo
		// function()	= função callback
		// err			= se houver err, ele retorna o erro
		// data 		= dados do arquivo que readFile leu
		fs.readFile(__dirname + '/index.html',function(err,data){
			
			if(err) { 
				response.writeHead(500);
				return response.end("Erro na abertura do arquivo index.html = " + err);
				
			} else {
				
				response.writeHead(200, {"Content-Type" : "text/html"});
				response.end(data);
				
			}
			
		});
		
	}
	
	//array das mensagens
	var mensagens = [];
	
	//função para armazenar as mensagens
	function armazenarMensagem(nick,mensagem) {
		
		//variavel para guardar os dados vindos do cliente
		var msg = {
			nick : nick,
			texto: mensagem,
			hora: new Date().toLocaleTimeString() //pegando a hora da maquina local
		};
		
		//adicionando e enfileirando as mensagens com push
		// cria uma posição e guarda uma mensagem
		mensagens.push(msg);
		
		if(mensagens.length > 5) {
			
			mensagens.splice(0,1);
			
		}
		
		return msg;
		
	}
	
	//função para enviar as mensagens
	function enviarMensagens(client) {
		
		//utilizando o forEach para varrer todo vetor mantendo o código assincrono
		mensagens.forEach(function(msg){
			
			client.emit('mensagem', msg);
			
		});
		
	}
	
	//definindo o servidor que o socket deve escutar
	var io = sio.listen(server);
	
	//definindo o evento para conexão com o client
	io.sockets.on('connection',function(socket) {
		
		//enviando os logs no console
		console.log("O cliente com o id" + socket.id + "conectou");
		
		//definindo nick
		socket.on('set nick', function(nick) {
			
			//enviar o evento para um cliente especifico
			//parametro socket.id é a referencia para qual o broadcast 
			//ira direcionar o evento
			socket.broadcast.emit('conectou', nick, socket.id);
			
			//setando o atributo
			socket.set('nick', nick);
			
			//usando a função que enviara a mensagem
			enviarMensagens(socket);
			
		}); //evento para setar nick
		
		//
		socket.on('boas vindas',function(sid){
			
			//pegando nick
			socket.get('nick',function(err, nick) {
				
				//
				io.sockets.socket(id).emit('boas vindas',nick);
				
			})
			
		}); //enviando boas vindas
		
		//evento para enviar a mensagem para o cliente
		socket.on('enviar mensagem', function(mensagem){
			
			//monitorando mensagem enviada pelo cliente
			console.log("Chegou uma nova mensagem: " + mensagem);
			
			//pega o nick da mensagem
			socket.get('nick',function(err,nick) {
				
				//recebe a mensagem do client
				var msg = armazenarMensagem(nick, mensagem);
				
				//emitindo mensagem para todos conectados
				io.sockets.emit('mensagem',msg);
				
			});
			
		}); //enviando mensagens
		
	}); //conexão cliente x socket