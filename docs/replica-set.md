# MongoDB Replica Set (dev / CI)

This project uses Prisma with MongoDB. Some Prisma operations require transactions or rely on consistent DateTime conversions which work best when MongoDB is configured as a replica set.

Below are non-Docker steps to initialize a local replica-set for development on Windows (adjust for macOS/Linux):

1. Stop any running mongod
   - Use Task Manager or `Get-Process mongod` / `Stop-Process` in PowerShell.

2. Start `mongod` with a replica-set name and a data directory:

   pwsh (PowerShell):
   ```powershell
   mkdir -p C:\data\db
   mongod --dbpath C:\data\db --replSet rs0 --bind_ip 127.0.0.1 --port 27017
   ```

3. Open the Mongo shell to initiate the replica set:

   ```powershell
   mongosh --port 27017
   rs.initiate()
   rs.status()
   ```

4. Restart the app/dev server. Prisma should no longer surface P2031 transaction errors on single-node replica sets.

Notes:
- CI: If you can run a Mongo container in CI you can initialize a replica set there by starting `mongod` with `--replSet rs0` and executing the same `rs.initiate()`.
- If you cannot run a replica set, the project includes pragmatic raw DB fallbacks for dev to keep tests stable; however, **replica set is the recommended long-term fix**.
