# DoramaAI — Deploy Guide

## Estrutura do Projeto

```
doramaai/
├── artifacts/api-server/    → Bot Telegram principal (Node.js)
├── replicate-deploy/        → Microserviço TTS (Python/Cog)
├── lib/                     → Bibliotecas compartilhadas
├── railway.toml             → Config Railway
├── Dockerfile               → Build Docker
└── DEPLOY.md                → Este arquivo
```

## 1. Deploy Railway (Bot Telegram)

### Variáveis de Ambiente Obrigatórias
```
TELEGRAM_BOT_TOKEN=<token do @BotFather>
```

### Variáveis Opcionais
```
DID_API_KEY=<chave D-ID para vídeos animados>
TELEGRAM_ADMIN_ID=<seu ID numérico do Telegram>
OPENPIX_API_KEY=<chave OpenPix para pagamentos PIX>
PIX_KEY=<chave PIX manual (fallback)>
TONCOIN_ADDRESS=<endereço TON para pagamentos crypto>
VIP_PRICE_BRL=29.90
VIP_PRICE_TON=2.5
```

### Comandos
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Linkar ao projeto existente
railway link

# Deploy
railway up
```

### Webhook OpenPix (se usar pagamentos PIX)
URL: `https://<seu-dominio-railway>/api/webhooks/pix`
Evento: `OPENPIX:CHARGE_COMPLETED`

---

## 2. Deploy Replicate (TTS)

### Comandos
```bash
cd replicate-deploy

# Instalar Cog
pip install cog

# Testar localmente
cog predict -i text="Oi, sou a Yuna..."

# Push para Replicate
cog push r8.im/<seu-usuario>/doramaai-tts
```

---

## Melhorias Aplicadas (v4)

### Voz
- Estilo "whispering" (sussurro provocante) em vez de "chat"
- Pitch +3% a +5% (voz fina, feminina, sedutora)
- Rate 65-78% (fala lenta, ousada, sem pressa)
- Pausas sensuais maiores entre frases (500-900ms)
- Texto expandido para 1200 chars (mais narração)

### Vídeo D-ID
- motion_factor 0.65-0.7 (movimentos mais suaves e sensuais)
- pad_audio aumentado (mais tempo de vídeo)
- Animação mais fluida com expressões naturais

### Yuna
- Welcome audio mais ousado e atrevido
- Tom provocante sem timidez
- Descrição atualizada para refletir o estilo
