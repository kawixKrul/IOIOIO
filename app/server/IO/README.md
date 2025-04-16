Aby zbuildować docker-compose bazy danych postgres:
``` bash
cd app/database
docker-compose up -d
```

Aby uruchomić jeżeli już istnieje:
``` bash
docker start postgres-db
```

Jak już baza danych działa to aby uruchomić backend najprościej w Intelij uruchomić plik EngineMain.
