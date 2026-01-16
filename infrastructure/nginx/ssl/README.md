# SSL Certificates

Certificados SSL serão colocados aqui.

## Como gerar certificados

```bash
sudo certbot certonly --standalone -d app.jurisnexo.com.br -d api.jurisnexo.com.br
```

## Arquivos necessários

- `fullchain.pem`
- `privkey.pem`

## Copiar certificados

```bash
sudo cp /etc/letsencrypt/live/app.jurisnexo.com.br/fullchain.pem ./
sudo cp /etc/letsencrypt/live/app.jurisnexo.com.br/privkey.pem ./
```
