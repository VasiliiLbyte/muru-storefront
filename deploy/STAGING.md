# Staging: web.murushop.ru

Headless-витрина MURU на том же VPS, что и Mini App (`109.172.38.194`).

| Компонент | Значение |
|-----------|----------|
| Домен | `https://web.murushop.ru` |
| API | `https://murushop.ru/api` |
| Процесс | PM2 `muru-storefront`, порт `3000` |
| Код | `/var/www/muru-storefront` |

Основной сайт `murushop.ru` не затрагивается — отдельный nginx `server_name`.

---

## 1. DNS

A-запись: `web.murushop.ru` → `109.172.38.194`

---

## 2. Первый деплой

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/VasiliiLbyte/muru-storefront.git
sudo chown -R $USER:$USER /var/www/muru-storefront
cd /var/www/muru-storefront
```

Скопировать production env **до сборки** (`NEXT_PUBLIC_* встраиваются в `npm run build`):

```bash
cp deploy/.env.production.example .env.production
```

Сборка и prod-зависимости:

```bash
npm ci
NODE_OPTIONS=--max-old-space-size=2048 npm run build
npm ci --omit=dev
```

PM2:

```bash
pm2 start deploy/ecosystem.storefront.config.js
pm2 save
pm2 status
```

`ecosystem.storefront.config.js` задаёт `NEXT_PUBLIC_API_BASE` в runtime (обязательно для SSR каталога). Файл `.env.production` нужен **только для `npm run build`**.

Nginx (первый раз — **до** выпуска сертификата используй HTTP-only bootstrap, иначе `nginx -t` упадёт на отсутствующих SSL-файлах):

```bash
# Временный vhost только на :80 (скопируй блок ниже в /etc/nginx/sites-available/web.murushop.ru.conf)
# server { listen 80; server_name web.murushop.ru; location / { proxy_pass http://127.0.0.1:3000; ... } }
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d web.murushop.ru
# После certbot — замени конфиг на полный deploy/nginx-web.murushop.ru.conf (HTTPS + redirect :80)
sudo cp deploy/nginx-web.murushop.ru.conf /etc/nginx/sites-available/web.murushop.ru.conf
sudo nginx -t && sudo systemctl reload nginx
```

Если сертификат уже есть:

```bash
sudo cp deploy/nginx-web.murushop.ru.conf /etc/nginx/sites-available/web.murushop.ru.conf
sudo ln -sf /etc/nginx/sites-available/web.murushop.ru.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 3. Backend (YooKassa return URL)

На том же VPS в `.env` бэкенда (`muru-backend` / PM2 `muru-backend`):

```env
YOOKASSA_WEB_RETURN_URL=https://web.murushop.ru/checkout/return/
```

Перезапустить backend после изменения:

```bash
pm2 restart muru-backend
```

---

## 4. Smoke-тест

```bash
curl -I https://web.murushop.ru
```

В браузере:

1. Главная и каталог открываются
2. «Добавить в корзину» → badge в header
3. `/basket/` — название, цена, картинка
4. `/checkout/` — CDEK/оплата (при необходимости)

---

## 5. Обновление релиза

```bash
cd /var/www/muru-storefront
git pull
cp deploy/.env.production.example .env.production   # только если менялся шаблон env
npm ci
NODE_OPTIONS=--max-old-space-size=2048 npm run build
npm ci --omit=dev
pm2 restart muru-storefront
```

---

## Файлы в `deploy/`

| Файл | Назначение |
|------|------------|
| `nginx-web.murushop.ru.conf` | nginx vhost → `127.0.0.1:3000` |
| `ecosystem.storefront.config.js` | PM2 конфиг |
| `.env.production.example` | шаблон env для staging/prod |
