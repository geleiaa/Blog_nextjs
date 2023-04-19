---
title: 'nodejs error handling'
date: '2023-04-17'
description: 'Nesse artigo falarei um pouco sobre tratamento de erros em aplicações NodeJs.'
---

Nesse artigo vamos ver um pouco sobre tratamento de erros (mais conhecido como "Error Handling") em aplicações NodeJs.

A alguns dias atrás resolvi dar uma atenção maior para esse tema por ser uma parte muito importante em aplicações backend no geral, não só para aplicações Nodejs. Então depois de alguns dias pesquisando e testando algumas coisas resolvi escrever um pouco sobre o que eu aprendi.  

Vou dar uma introdução ao assunto e deixar algumas referências no final para quem quiser se aprofundar no conteúdo.

##### *"O tratamento de erros é uma dor de cabeça e é fácil passar muito tempo no Node.js sem lidar com os erros corretamente. No entanto, construir aplicativos Node.js robustos requer lidar com os erros adequadamente, e não é difícil aprender como."* 
>___

Este artigo pressupõe que você já saiba algumas coisas tipo:
- * conhecimento básico de Node.js
- * conhecimento de Express.js (rotas, middleware e outros)
- * noções básicas de Javascript ou Typescript (e classes)
- * noções básicas de como uma API funciona
>___

### `Introdução`

## Vamos começar com, O QUE É TRATAMENTO DE ERROS?

#### A resposta para essa pergunta é simples, seguindo a lógica, o tratamento de erros é uma forma de encontrar e/ou prever erros no seu código e resolvê-los. A partir daí você pode ter pensado que a parte difícil é configurar uma boa base de tratamento de erros.
#### Mas para facilita um pouco as coisas, nas minhas pesquisas encontrei várias pessoas falando de dois tipos de erros que englobam alguns cenários e como lidar com eles.

#### Com isso agora vamos para os...

# Tipos de Errors:
# Erros operacionais  vs  Erros de programação

#### `Distinguir os dois tipos de erros a seguir ajuradá você a compreender melhor o que podem causar esses erros e também ajudará a pensar em formas de resolve-los.`

## 1º Erros Operacionais: (operational errors)
#### Os errors operacionais representam os erros que o desenvolvedor pode prever. Não são "bugs" na app, são coisas que inevitavelmente acontecerão quando as pessoas interagirem com a aplicação. Um exemplo é quando um usuário tenta acessar uma rota não definida em uma API, que geralmente retorna algo como "404 - Not Found". Esses erros são esperados no tempo de execução (runtime) do Node.js e devem ser tratados de maneira adequada.
Os erros operacionais também incluem: 
- *Falha ao conectar em um servidor
- *Falha ao conectar no banco de dados
- *Uma request falha por algum motivo
- *Algum tipo de entrada inválida do dados
- *Servidor retornando resposta 500
- *Problemas de rede/banda
- e por ai vai...

#### Para os erros operacionais vale a pena ressaltar que qualquer código que faça qualquer coisa que possa falhar (como abrir um arquivo, conectar-se a um servidor, e assim por diante) `deve considerar` o que acontece quando essa operação falha. Isso inclui saber como pode falhar e o que tal falha indicaria.

>___

## 2º Erros de Programação: (programming errors)
#### Os erros do programação são os casos em que o desenvlovedor cometeu o erro, referem-se aos bugs de fato (algumas vezes você não tem ideia do motivo e de onde veio o erro). Podem ser erros na sintaxe ou na lógica da aplicação. Essas são coisas que sempre podem ser evitadas alterando o código. Eles nunca podem ser tratados adequadamente (já que o código em questão está quebrado).
Os erros de programação também incluem:
- *Tentar ler uma propriedade em um objeto que não está definido
- *Passar parâmetros incorretos em uma função
- *Promises não tratadas 
- e por ai vai...
>___

#### E porque dividir os tipos de errors dessa forma? 
#### É simples, para cada tipo de erro tem uma maneira melhor de trata-lo. Dependendo do erro e de como você o resolve, poderá afetar o desempenho e a usabilidade da aplicação.

>___


##### `Depois dessas explicações veremos algumas formas de lidar com os erros.`

##### `Vamos começar com dois exemplos de como tratar Erros Operacionais: `

#### `1º` - Uma pratica bem comum no tratamento de erros é usar uma classe de erro customizada que extende o objeto `Error` do nodejs. Usando essa classe você pode lançar erros/exceções com mensagens e um status-code diferentes quando precisar: (mais informações [*AQUI*](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/useonlythebuiltinerror.md))


```javascript
  class AppError extends Error {
    constructor(
      public message: string,
      protected statuscode: number = 500,
      protected descript?: string
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
```

#### Com essa classe você pode lançar erros de uma função envolvendo em um bloco `try/catch` dessa forma:
```javascript
    try{
      // algum código...
    } catch(err){
      throw new AppError(err.message, 404, 'description');
    }
```

#### Ou também você extender essa classe e criar outra classe para um erro mais específico:

```javascript
  class ErroMaisEspecifico extends AppError {
    constructor(message: string) {
      const MensagemEspecifica =
        'Mensagem para o erro específico';
      super(`${MensagemEspecifica}: ${message}`);
    }
  }
```
>___

#### `2º` - Outra pratica bastante usada é a de criar `middlewares` que encaminham o erro de uma `solicitação web` para um manipulador de erros central. 
#### A maioria dos frameworks web tem algum mecanismo de middleware de detecção de erros, como o `Express` que usa um middleware com quatro argumentos: *`(err, req, res, next)`*.
#### Quando um middleware tem esses quatro argumentos o Express reconhece como sendo um tratamento de erros. (mais sobre [AQUI](https://expressjs.com/en/guide/error-handling.html))
#### Um fluxo de tratamento de erros por middleware pode ser: 
* 1º Algum módulo lança um erro-> 
* 2º a função da rota da API detecta o erro-> 
* 3º a função propaga o erro para o middleware que é responsável por detectar os erros->
* 4º um manipulador de erros centralizado é chamado->
* 5º por fim o manipulador manda a resposta de erro.
>_
```javascript
// código da rota da API, em caso de erro manda para o middleware de erros

  try {
        const newUser = await serivce.create(req.body);

        res.status(201).send(newUser);

      } catch (error) {
        next(error) // manda o  erro parao proximo middleware
      }

// Middleware de erros pega o erro e chama o manipulador de erros central

  app.use(async (error: Error, req: Request, res: Response, next: NextFunction) => {
    await errorHandler.handleError(err, res);
  });

// então o manipulador trata o erro e manda uma resposta de volta

  class ErrorHandler {
    public async handleError(error: Error, res: Response): Promise<void> {
      await logger.logError(error);
      await sendErrorResponse(error, res);
    };
  }
```

Vale a pena ressaltar que esse tipo de tratamento por middleware pode ser feito de várias formas diferentes e você usar uma abordagem que te ajude melhor.
>___


##### `Agora os dois proximos exemplos são relacionados com os Erros de Programação: `

Os Erros de Programação geralmente podem causar problemas nas aplicações, como vazamentos de memória e alto uso da CPU. A melhor maneira de se recuperar de erros do programador é "crashar" a aplicação imediatamente e reiniciá-la normalmente usando uma "Restarter tool" como PM2 ou Forever.

#### `3º` - Promises não tratadas (Unhandled Rejections): Você pode passar muito tempo lidando com `Promises` ao trabalhar em aplicações Node.js/Express e caso essas Promises não sejam tratadas corretamente os erros lançados nesses locais não são tratados pelo manipulador de erros central e desaparecem.
#### Versões recentes do Node adicionaram uma mensagem de aviso `"unhandledRejection"` que indica uma Promise não resolvida.
#### A solução direta é nunca esquecer de resolver as Promises com `.then/.catch` ou `async/await` em cada chamada que redirecionam para um manipulador de erros central. Porém é uma boa prática usar um `fallback` que recebe o erro não tratado:

```javascript
  process.on('unhandledRejection', err => { // detecta o evento "unhandledRejection"
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION! Shutting down...');

    process.exit(1); // encerra a execução de processo que recebeu o erro
  });
```

#### `4°` - Exceções/Erros inesperados (Uncaught Exceptions): Funcionam da mesma forma que Promises não tratadas só que para código `síncrono`. 
#### Pode acontecer de módulo da apilcação ter algum problema e disparar um erro que não seja esperado. Lidar com isso se parece muito com lidar com rejeições não tratadas.  Uma diferença fundamental é que não precisamos mais de uma callback, pois é um código síncrono.

```javascript
process.on('uncaughtException', err => { //detecta o evento "uncaughtException"
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');

  process.exit(1); // encerra a execução de processo que recebeu o erro
});
```
>___

Para finalizar quero dizer que há muito mais formas de tratar erros do que as citadas aqui. O tratamento de erros é um assunto amplo e pode ser feito de várias maneiras, dependendo da aplicação, das tecnologias utilizadas e etc, esses exemplos são básicos e seviram para mostrar uma maneira de fazer.

E também há espaço para melhorias nesse artigo pois não sou um especialista no assunto e tudo aqui é só um pedaço do conteúdo que encontrei por ai.

Espero que tenha sido útil, até a proxima. o/

:)

>___
Referências:
- [<https://github.com/goldbergyoni/nodebestpractices#2-error-handling-practices>]
- [<https://sematext.com/blog/node-js-error-handling/>]
- [<https://medium.com/@SigniorGratiano/express-error-handling-674bfdd86139>]
- [<https://dev.to/valentinkuharic/beginner-friendy-guide-to-error-handling-in-typescript-nodejs-expressjs-api-design-432i>]
- [<https://web.archive.org/web/20220128053456/https://www.joyent.com/node-js/production/design/errors>]

