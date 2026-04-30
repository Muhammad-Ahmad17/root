# Database Manual for `backend/config/db.js`

Use this file as a fill-in sheet before you wire the database in code. The image already found in Docker is `postgres:16-alpine`.

## 1) Fill in the blanks

- Image name: `postgres:16-alpine`
- Container name: ____________________
- Host: ____________________
- Host port: ____________________
- Container port: `5432`
- Database name: ____________________
- Username: ____________________
- Password: ____________________
- Dialect: `postgres`
- Connection location: `localhost` or `docker network`
- SSL mode: ____________________
- Pool max: ____________________
- Pool min: ____________________
- Pool idle: ____________________
- Pool acquire: ____________________

Example values you can replace later:

```txt
Container name: my-postgres
Host: localhost
Host port: 5432
Database name: mydb
Username: myuser
Password: mypass
SSL mode: disable
Pool max: 10
Pool min: 0
Pool idle: 10000
Pool acquire: 30000
```

## 2) Run the image

1. Confirm the image exists locally in Docker images.
	 ```bash
	 docker images | grep postgres
	 ```
2. Start a container from `postgres:16-alpine`.
	 ```bash
	 docker run -d \
		 --name my-postgres \
		 -e POSTGRES_DB=mydb \
		 -e POSTGRES_USER=myuser \
		 -e POSTGRES_PASSWORD=mypass \
		 -p 5432:5432 \
		 postgres:16-alpine
	 ```
3. Give the container a clear name so you can reuse it in later tests.
	 ```bash
	 docker ps
     docker log <container-id>
	 ```
4. Publish port `5432` to a host port you want to use.
	 ```bash
	 docker port my-postgres
	 ```
5. Set the database name, username, and password at container creation time.
	 ```bash
	 docker inspect my-postgres --format '{{json .Config.Env}}'
	 ```
6. Wait until the container reports that Postgres is ready to accept connections.
	 ```bash
	 docker logs -f my-postgres
	 ```

## 3) Decide the connection values

- If your backend runs directly on your machine, use `localhost` as the host.
- If your backend runs in another Docker container, use the Postgres container name or Docker service name as the host.
- The host port must match the published Docker port.
- The container port stays `5432` because that is Postgres inside the container.
- The database name, username, and password must match the values used when the container was first created.

Example connection values:

```txt
Host: localhost
Port: 5432
Database: mydb
User: myuser
Password: mypass
```

If both app and database are inside Docker:

```txt
Host: my-postgres
Port: 5432
Database: mydb
User: myuser
Password: mypass
```

## 4) Test the setup

1. Check that the container is running.
	```bash
	docker ps | grep my-postgres
	```
2. Check that the port is exposed.
	```bash
	docker port my-postgres
	```
3. Check that the database name exists inside the container.
	```bash
	docker exec -it my-postgres psql -U myuser -d mydb
	```
4. Check that the username and password work.
	```bash
	docker exec -it my-postgres psql -U myuser -d mydb
	```
5. Check that your backend can connect using the same values.
	```bash
	psql -h localhost -p 5432 -U myuser -d mydb
	```
6. Restart the container and test the connection again.
	```bash
	docker restart my-postgres
	```

## 5) What should pass

- The container starts without errors.
- Postgres becomes ready successfully.
- The backend connects with the values you filled in.
- Restarting the container does not break the connection.

Quick success check:

```bash
docker ps | grep my-postgres && docker logs my-postgres | tail -n 20
```

## 6) If a test fails

- Image problem: use the exact image name and tag from Docker.
- Host problem: use `localhost` for a local app, or the container/service name inside Docker.
- Port problem: recheck the Docker port mapping.
- Credential problem: recreate the container if the initial values were different.
- Database problem: confirm the database name was set when the container was created.

Helpful recovery commands:

```bash
docker rm -f my-postgres
docker run -d \
	--name my-postgres \
	-e POSTGRES_DB=mydb \
	-e POSTGRES_USER=myuser \
	-e POSTGRES_PASSWORD=mypass \
	-p 5432:5432 \
	postgres:16-alpine
```

## 7) Simple rule

The image is only the template. The container is the running database. Your backend must connect to the container values, not to the image itself.

Rule in command form:

```bash
docker images
docker ps
docker logs my-postgres
```


## PostgreSQL Pool Configuration

### Connection Fields (Essential ✅)

| Field | Default | Purpose |
|-------|---------|---------|
| `host` | `localhost` | Database server address (IP or domain) |
| `port` | `5432` | PostgreSQL default port |
| `database` | `mydb` | Target database name |
| `user` | `myuser` | Auth username |
| `password` | `mypass` | Auth password |

These 5 are **non-negotiable** — without them, no connection is possible.

---

### Pool Sizing Fields

| Field | Default | Purpose |
|-------|---------|---------|
| `max` | `10` | Max simultaneous connections in the pool |
| `min` | `0` | Connections kept alive even when idle |

- **`max`** is the most impactful — set it too high and you'll overwhelm Postgres (default max is 100 server-side). A value of `10–20` is typical per app instance.
- **`min`** is optional. Keeping it at `0` means connections are created on demand and released when idle.

---

### Timeout Fields

| Field | Default | Purpose |
|-------|---------|---------|
| `idleTimeoutMillis` | `10000` | How long an idle connection sits in pool before being closed |
| `connectionTimeoutMillis` | `30000` | How long a request waits to acquire a connection before throwing an error |

- **`connectionTimeoutMillis`** is the more important of the two — it prevents requests from hanging forever when the pool is exhausted.

---

### SSL Field

| Field | Purpose |
|-------|---------|
| `ssl` | Encrypts the connection to Postgres |

```typescript
ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : false
```

- **Essential in production** (e.g., RDS, Supabase, Neon all require SSL).
- `rejectUnauthorized: false` skips certificate validation — fine for managed DBs with self-signed certs, but tighten this if you control the CA.

---

### TL;DR — Bare Minimum

```typescript
const pool = new Pool({
  host:     process.env.PGHOST,
  port:     Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
});
```

Everything else has sensible defaults, but `max`, `connectionTimeoutMillis`, and `ssl` are worth setting explicitly in any real app.