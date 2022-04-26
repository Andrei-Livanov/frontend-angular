import * as https from "https";
import express from 'express';
import proxy from 'http-proxy-middleware'; // для создания прокси сервера
import path from 'path'; // для путей к скомпилированным файлам
import fs from 'fs';

const app = express(); // создаем объект express для настройки и старта

// хостинг (веб контейнер)
const herokuBackendUrl = 'https://planner-backend.herokuapp.com';

const rootPath = path.resolve(); // путь до папки, где будет расположен проект в heroku
const appName = 'frontend-angular'; // должно совпадать с названием проекта

app.use('/api', proxy.createProxyMiddleware({
  target: herokuBackendUrl,
  changeOrigin: true, // изменить параметр origin - откуда приходит запрос - будет убрано слово "api"
  secure: true,
  withCredentials: true, // отправлять кук
  pathRewrite: { // удалить слово api из url
    "^/api/": ""
  }
}));

// путь до скомпилированных файлов в папке dist - все входящие запросы будут направляться именно в эту папку
app.use(express.static(rootPath + '/dist/' + appName));

// проверяем все входящие запросы
app.get('*', function (req, res, next) {
  if (req.headers['x-forwarded-proto'] != 'https') // если запрос не содержит https
    res.redirect(herokuBackendUrl + req.url) // тогда явно перебросить на https
  else
    next()
})

// все запросы направляем в папку dist
app.get('/*', function (req, res) {
  const fullPath = path.join(rootPath + '/dist/' + appName + '/index.html');
  res.sendFile(fullPath);
})

// для проверки и локального запуска ---------------------------------------------

// const options = {
//   key: fs.readFileSync(rootPath + '/dist/' + appName + '/assets/ssl/javabegin_ssl.key'),
//   cert: fs.readFileSync(rootPath + '/dist/' + appName + '/assets/ssl/javabegin_ssl.cer')
// };
// const appServer = https.createServer(options, app);
//
// const port = process.env.PORT || 3001;
//
// // запуск сервера
// appServer.listen(port, () => console.log(`App running on: https://localhost:${port}`));

// ---------------------------------------------

// запуск сервера на heroku
const server = app.listen(process.env.PORT || 8080, function () {
  const port = server.address().port;
  console.log("App now running on port", port);
});
