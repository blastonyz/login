import express from 'express';
import handlebars from 'express-handlebars';
import sessions from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';

import { __dirname } from './utils.js';
import { generateProduct } from './utils/utils.mocking.js';
import path from 'path';
import {init as initPassport} from './passport/passport.config.js';
import config from './config/config.js';
import { errorHandlerMiddleware } from './utils/error.handler.middleware.js';

import cartRouter from "./routes/views/cartRoutes.js"
import productRouter from "./routes/productRoute.js";
import productManager from './dao/productManager.js';
import viewsRoutes from './routes/viewsRoutes.js';
import indexRouter from './routes/views/index.router.js';
import chatRouter from './routes/api/chat.router.js';
import sessionRouter from './routes/api/session.router.js'
import sessionRender from './routes/views/sessions.render.js'



const SESSION_SECRET = config.session_secret;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'../public')));

app.use(sessions({
    store: MongoStore.create({
       mongoUrl: config.mongodbUri,
       mongoOptions: {}, 
    }),
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
}))



initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');



//persistencia de memoria con websocket
app.get('/home',async (req,res) => {
    const product = await productManager.getProducts();
    res.render('index' , { title: 'handlebars y socket.io',product});
});
//persistencia de memoria JSON local
app.use('/old',productRouter);
//middleware de ruta
app.get('/', (req,res) =>{
    res.redirect('/login')
});
//MongoDB
//login
app.use('/', sessionRender, sessionRouter);

//paginacion
app.use('/api',indexRouter);

//vista de carts
app.use('/api',cartRouter);

//chat
app.use('/api',chatRouter);

//realtime, websocket y mongoDB
app.use('/set',viewsRoutes);

//mocking
app.get('/mockingporducts',(req,res)=>{
    const productMocks = [];
    for (let index = 1; index < 100; index++) {
        productMocks.push(generateProduct());
        
    }
 res.status(200).json(productMocks);   
})

app.use(errorHandlerMiddleware)


 export default app;

