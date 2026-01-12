# SoMe Planner - Opsætningsguide

Denne guide hjælper dig med at komme i gang med SoMe Planner.

## Forudsætninger

- PHP 8.0 eller højere
- MySQL 5.7+ eller MariaDB 10.3+
- Webserver (Apache/Nginx) eller PHP's indbyggede server

## Trin-for-trin Installation

### 1. Clone projektet

```bash
git clone https://github.com/WebJax/Some-Planner.git
cd Some-Planner
```

### 2. Opsæt database

Opret databasen og tabellerne:

```bash
# Log ind i MySQL
mysql -u root -p

# Kør schema fra MySQL prompt
source database/schema.sql

# Eller fra kommandolinjen
mysql -u root -p < database/schema.sql
```

Dette opretter:
- Database `some_planner`
- Tabeller: `shops`, `posts`, `media`, `templates`
- Eksempeldata: 3 butikker og 3 skabeloner

### 3. Konfigurer applikationen

Filen `config.php` er allerede oprettet med standardindstillinger. Hvis du har brug for at ændre databaseforbindelsen:

```bash
# Rediger config.php
nano config.php
```

Opdater følgende værdier hvis nødvendigt:
- `DB_HOST` - Database host (standard: localhost)
- `DB_NAME` - Database navn (standard: some_planner)
- `DB_USER` - Database bruger (standard: root)
- `DB_PASS` - Database adgangskode (standard: tom)

### 4. Opret uploads-mappe

Uploads-mappen er allerede oprettet, men sørg for at den har de rette tilladelser:

```bash
chmod 755 uploads
```

### 5. Start webserveren

For udvikling kan du bruge PHP's indbyggede server:

```bash
php -S localhost:8000
```

Åbn browser på: http://localhost:8000

### 6. Log ind

Standard login-oplysninger:
- **Brugernavn:** `admin`
- **Adgangskode:** `admin123`

⚠️ **VIGTIGT:** Skift adgangskoden i produktion!

## Skift Admin Adgangskode

For at ændre admin-adgangskoden:

1. Generer en ny password hash:

```php
<?php
echo password_hash('din_nye_adgangskode', PASSWORD_DEFAULT);
?>
```

2. Kør denne PHP-kode i en browser eller via CLI:

```bash
php -r "echo password_hash('din_nye_adgangskode', PASSWORD_DEFAULT) . PHP_EOL;"
```

3. Kopier hashen og indsæt den i `config.php` under `ADMIN_PASSWORD_HASH`

## Mappestruktur

```
Some-Planner/
├── api/              # Backend API endpoints
│   ├── auth.php      # Autentificering
│   ├── posts.php     # Post-håndtering
│   ├── shops.php     # Butikshåndtering
│   ├── templates.php # Skabelonhåndtering
│   └── uploads.php   # Filupload
├── core/             # Core PHP-klasser
│   ├── Auth.php      # Autentificering
│   ├── Database.php  # Database forbindelse
│   └── Response.php  # API responses
├── css/              # Stylesheets
│   ├── reset.css     # CSS reset
│   ├── variables.css # Design tokens
│   ├── layout.css    # Layout styles
│   └── components.css # Komponent styles
├── database/         # Database scripts
│   └── schema.sql    # Database schema
├── js/               # Frontend JavaScript
│   ├── App.js        # Hovedapplikation
│   ├── ApiService.js # API kommunikation
│   ├── Calendar.js   # Kalendervisning
│   ├── PostCard.js   # Post editor
│   ├── ShopInbox.js  # Butikshåndtering
│   └── TemplateManager.js # Skabeloner
├── uploads/          # Uploadede filer
├── index.html        # Hovedside
├── login.html        # Login side
└── config.php        # Konfiguration
```

## Funktioner

### 📅 Kalendervisning
- Månedsvisning af alle opslag
- Navigation mellem måneder
- Farvekoder efter status (draft/ready/published)
- Klik på dato for at oprette nyt opslag

### 📝 Opslag
- Opret og rediger posts/reels
- Tildel opslag til butikker
- Upload billeder og videoer
- Brug skabeloner til captions
- Status-håndtering

### 🏪 Butikker
- Administrer butikker
- Kontaktinformation
- Aktiv/inaktiv status

### 📋 Skabeloner
- Genbrugelige caption-skabeloner
- Medieguides
- Variabler til dynamisk indhold

## Fejlfinding

### Problem: "Database connection failed"

**Løsning:**
1. Tjek at MySQL kører: `sudo service mysql status`
2. Verificer database credentials i `config.php`
3. Tjek at databasen `some_planner` eksisterer

### Problem: "Upload failed"

**Løsning:**
1. Tjek at `uploads/` mappen eksisterer
2. Tjek tilladelser: `chmod 755 uploads`
3. Tjek `upload_max_filesize` i `php.ini`

### Problem: "Session expired"

**Løsning:**
- Log ind igen
- Standard session lifetime er 8 timer
- Kan ændres i `config.php` under `SESSION_LIFETIME`

### Problem: Blank side/ingen output

**Løsning:**
1. Tjek PHP error log
2. Aktiver error reporting midlertidigt:
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```
3. Tjek browser console for JavaScript fejl

## Produktion

Før du deployer til produktion:

1. ✅ Skift admin adgangskode
2. ✅ Opdater `config.php` med sikre database credentials
3. ✅ Sæt stærke passwords
4. ✅ Aktiver HTTPS
5. ✅ Deaktiver PHP error display
6. ✅ Begræns filopload typer og størrelser
7. ✅ Opsæt regelmæssige backups
8. ✅ Tilføj `config.php` til `.gitignore`

## Support

For hjælp og spørgsmål:
- Læs dokumentationen i `README.md`
- Se arkitekturbeskrivelsen i `agents.md`
- Kontakt udvikleren

## Licens

MIT License
