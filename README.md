# SoMe Planner

En webapp til planlægning og overblik over sociale medier for et lokalt butikscenter.

## Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6, OOP)
- PHP 8+
- MySQL

Ingen frameworks. Fokus på stabilitet, gennemsigtighed og let vedligehold.

## Installation

### 1. Krav

- PHP 8.0 eller højere
- MySQL 5.7+ eller MariaDB 10.3+
- Webserver (Apache/Nginx)

### 2. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

### 3. Konfiguration

```bash
cp config.example.php config.php
```

Rediger `config.php` og tilpas databaseindstillinger og andre parametre.

**⚠️ VIGTIGT FOR PRODUKTION:**
- `config.php` indeholder default credentials til udvikling
- For produktion, tilføj `config.php` til `.gitignore`
- Brug altid stærke, unikke passwords
- Skift admin-adgangskoden før deployment

### 4. Opret admin-adgangskode

Kør følgende PHP-kode for at generere en password hash:

```php
<?php
echo password_hash('your_password', PASSWORD_DEFAULT);
?>
```

Indsæt hashen i `config.php` under `ADMIN_PASSWORD_HASH`.

### 5. Opret upload-mappe

```bash
mkdir -p uploads
chmod 755 uploads
```

### 6. Start webserver

For udvikling:

```bash
php -S localhost:8000
```

Åbn browser på: http://localhost:8000

## Struktur

```
/
├── api/              # Backend API endpoints
├── core/             # Core PHP classes
├── css/              # Stylesheets
├── js/               # Frontend JavaScript
├── database/         # Database schema
├── uploads/          # Uploaded media files
├── index.html        # Main application
└── login.html        # Login page
```

## Funktioner

- Månedsvisning med kalender
- Opret og rediger opslag (posts/reels)
- Tildel opslag til butikker
- Status-håndtering (draft/ready/published)
- Upload af billeder og video
- Skabeloner til captions
- Butiksoverblik

## Sikkerhed

- Session-baseret admin-login
- CSRF-beskyttelse
- Filupload-begrænsninger
- Prepared statements til database

## Licens

MIT
