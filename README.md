# Oura Server

- create oura auth request for a user
- handle oura auth callback for a specific user
- store user auth data for future oura calls
- use auth data to hit oura api to request daily readiness score data

## Setup

Create a .env and add your Oura client app info from [Oura's developer dashboard](https://cloud.ouraring.com/oauth/applications)

```bash
cp .env.sample .env
```

use ngrok server forwarding

```bash
Forwarding https://bb7a-213-152-241-52.ngrok-free.app -> http://localhost:3000
```

## Paths

start auth flow with a dummy address
localhost: http://localhost:8000/promptOuraAuth?userAddress=0x2389r082389239
ngrok: https://{your-custom-ngrok}.ngrok-free.app/promptOuraAuth?userAddress=0x2389r082389239
prod: https://gm-ready.onrender.com/promptOuraAuth?userAddress=0x2389r082389239

1 week of oura readiness (must have authorized)
localhost:
ngrok: https://{your-custom-ngrok}.ngrok-free.app/getReadinessData/2024-03-08/2024-03-15
prod: https://gm-ready.onrender.com/getReadinessData/2024-03-08/2024-03-15
