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

The app now expects a MySQL database URL:

```text
mysql://USERNAME:PASSWORD@HOST:3306/yummy_bite
```

You can manage that database from MySQL Workbench. A matching SQL reference schema is available at:

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

For MySQL, set `DATABASE_URL` to your hosted MySQL connection string, for example:

```text
mysql://USERNAME:PASSWORD@HOST:3306/yummy_bite
```
