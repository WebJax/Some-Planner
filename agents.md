# agents.md

## Formål
Denne fil beskriver, hvordan en lille webapp (SoMe Planner) skal bygges.
Webappen bruges til planlægning og overblik over sociale medier for et lokalt butikscenter.

Stacken er bevidst enkel:
- HTML5
- CSS3
- Vanilla JavaScript (ES6, OOP-struktur)
- PHP 8+
- MySQL

Ingen frameworks. Fokus på stabilitet, gennemsigtighed og let vedligehold.

---

## Overordnet arkitektur

- Frontend: statisk HTML + CSS + JS
- Backend: PHP (MVC-light struktur)
- Database: MySQL
- Kommunikation: JSON via fetch (AJAX)

Frontend og backend er adskilt logisk, men ligger i samme projekt.

---

## Roller ("agents")

### 1. UI Agent
Ansvar:
- HTML-struktur
- Semantisk markup
- Tilgængelighed (labels, fokus, kontrast)

Principper:
- Mobile-first
- Maksimalt genbrug af komponenter
- Ingen inline styles

---

### 2. Styling Agent
Ansvar:
- Global CSS-struktur
- Enkelt design (kalender, kort, status)

CSS-struktur:
- css/reset.css
- css/variables.css
- css/layout.css
- css/components.css

Designprincipper:
- Klar typografi
- Rolige farver
- Status vises via farver/ikoner

---

### 3. Frontend Logic Agent (JavaScript)

Ansvar:
- Al interaktion i UI
- State-håndtering
- Kommunikation med backend

JavaScript-principper:
- ES6-moduler
- OOP (klasser pr. ansvar)
- Ingen globale variabler

Eksempel på klasser:
- App
- Calendar
- PostCard
- TemplateManager
- ShopInbox
- ApiService

Alle klasser initialiseres via én App-instans.

---

### 4. Backend Agent (PHP)

Ansvar:
- Datavalidering
- API-endpoints
- Adgangskontrol

Struktur:
- /api
  - posts.php
  - shops.php
  - templates.php
  - uploads.php
- /core
  - Database.php
  - Auth.php
  - Response.php

Principper:
- Returnér altid JSON
- Ingen HTML i backend
- Prepared statements (PDO)

---

### 5. Database Agent

Ansvar:
- Datamodel
- Relationer
- Konsistens

Tabeller (minimum):

shops
- id
- name
- contact_name
- active

posts
- id
- date
- type (post/reel)
- format (butik i fokus, engagement osv.)
- shop_id (nullable)
- status (draft/ready/published)
- caption

media
- id
- post_id
- file_path
- media_type (image/video)

templates
- id
- name
- caption_template
- media_guide

---

## Dataflow (kort)

1. UI loader månedsvisning
2. JS henter posts via API
3. Data vises som kort i kalender
4. Bruger redigerer / opdaterer
5. Ændringer sendes som JSON til backend
6. Backend validerer og gemmer i MySQL

---

## Sikkerhed

- Admin-login (session-baseret)
- CSRF-token ved POST/PUT
- Filupload begrænses til billeder/video
- Maks filstørrelse fastsat i PHP

---

## Udvidelser (ikke MVP)

- Ekstern upload-side til butikker (token-link)
- Eksport af captions
- Simpel statistik pr. opslag

---

## Kodeprincipper

- Små filer
- Klare navne
- Kommentarer hvor logik ikke er åbenlys
- Ingen "magic numbers"

---

## Mål

Webappen skal:
- kunne bruges uden oplæring
- spare tid i daglig drift
- være let at udvide senere

Stabilitet og enkelhed prioriteres over features.
