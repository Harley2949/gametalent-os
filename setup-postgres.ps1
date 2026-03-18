# Setup PostgreSQL for GameTalent OS
$PGSQL = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$env:PGPASSWORD = "postgres"

# Create user
& $PGSQL -U postgres -c "CREATE USER gametalent WITH PASSWORD 'gametalent_password';" 2>$null
Write-Host "User created (or already exists)"

# Create database
& $PGSQL -U postgres -c "CREATE DATABASE gametalent_os OWNER gametalent;" 2>$null
Write-Host "Database created (or already exists)"

# Grant privileges
& $PGSQL -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE gametalent_os TO gametalent;" 2>$null
Write-Host "Privileges granted"

Write-Host "PostgreSQL setup completed!"
