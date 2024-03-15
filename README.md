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
Forwarding https://7853-213-152-241-52.ngrok-free.app -> http://localhost:3000
```

## Paths

start auth flow
https://7853-213-152-241-52.ngrok-free.app/promptOuraAuth

1 week of oura readiness (must have authorized)
https://7853-213-152-241-52.ngrok-free.app/getReadinessData/2024-03-08/2024-03-15
