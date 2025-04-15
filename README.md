## Uruchamianie aplikacji

1. Build
```bash
git clone https://github.com/twoja-nazwa/IOIO.git
cd IOIO
```

2. Run
```bash
docker-compose up --build
```

Aplikacja będzie dostępna pod:
- Frontend: http://localhost
- Backend: http://localhost:8080
- Baza danych (PostgreSQL): localhost:5432
    - Użytkownik: wiktor
    - Hasło: tajnehaslo
    - Baza: moja_baza

3. Stop
``` bash
docker-compose down
```
