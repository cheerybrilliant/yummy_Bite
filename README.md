# yummy_Bite

ICT University canteen management system for students, cooks/staff, and admins.

## Local Run

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm start
```

Open:

```text
http://localhost:5050
```

The app is one Node service: Express serves the API and the static HTML/CSS/JS pages.

## Database

The single Prisma schema used by the app is:

```text
prisma/schema.prisma
```

`prisma/dev.db` is a local SQLite runtime database and is ignored by Git.

For MySQL Workbench, use:

```text
database/mysql-workbench-schema.sql
```

## Render

Use the root of this repository as the Render web service.

Build command:

```bash
npm install && npm run render-build
```

Start command:

```bash
npm start
```

Required environment variables:

```text
DATABASE_URL
JWT_SECRET
CANTEEN_MOMO_NUMBER
```

If you use SQLite on Render, attach a persistent disk and set `DATABASE_URL` to a disk path such as:

```text
file:/var/data/yummy-bite.db
```
