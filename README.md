# PokéArchiv Version 5.3 – Korrektur der Texterkennung

Die Erkennung versucht zunächst den zentralen Kartenbereich (für Karten auf Tischen) und anschließend das ganze Bild (für bildfüllende Live-Aufnahmen). Titelzone und Nummernzone werden kleiner zugeschnitten und separat gelesen. OCR-Zufallstexte mit geringer Konfidenz werden nicht als Kartentitel übernommen. Die erkannten Daten müssen weiterhin vor dem Suchen und Speichern bestätigt werden. Die Erkennung bleibt abhängig von Bildausschnitt, Lesbarkeit und iPhone-OCR; es gibt keine Garantie für automatische Identifikation.

**Update:** Vorher JSON-Backup erstellen, Dateien im bestehenden GitHub-Pages-Repository austauschen und Website-Daten nicht löschen. Die IndexedDB-Datenbank bleibt unverändert. Offline-Funktionen, Serienscan, Preise und Exporte bleiben erhalten.

# PokéArchiv Version 5.2 – iPhone / GitHub Pages

**Update von v4:** Bestehenden Repository-Pfad und GitHub-Pages-Domain beibehalten. Vor dem Update **JSON-Backup** aus v4 erstellen und außerhalb des Geräts sichern. Nur App-Dateien ersetzen; **nicht** Safari-Website-Daten löschen. Nach dem ersten Start online laden, damit Service Worker den v5-Cache installiert.

## Neuerungen

- **Live-Kartenscanner:** iPhone-Rückkamera mit dauerhaft geöffnetem Live-Vorschaufenster und eingerahmter Positionierung. Mit **Erkennen** wird ein Bild aus dem laufenden Videostream aufgenommen, per bestehender OCR analysiert und zur manuellen Bestätigung im Katalog angeboten. Nach dem Speichern bleibt die Kamera für die nächste Karte offen. Die Kamera wird beim Wechsel der Ansicht, Wechsel in den Hintergrund oder Schließen der Seite automatisch freigegeben. **Wichtig:** Kein kontinuierliches autonomes Erkennen ohne Tippen; das vermeidet ungewollte Scans und starke CPU-/Akku-Belastung. OCR braucht weiterhin Internet.
- **Preishistorie:** Neue IndexedDB-Tabelle `priceHistory`, ohne Veränderung am `cards`-Store. Tages-Schnappschüsse des *bekannten* Portfoliowerts und pro Karte, sobald ein bekannter Preis gespeichert oder aktualisiert wird. Keine historischen Kurse vor v5 und keine historische Bewertung von Karten ohne Preis. Veränderungen im Portfoliowert können auch aus geänderten Mengen entstehen.
- **Erweiterte Statistiken:** Karten und Einträge, Preise-Abdeckung, Top 10 nach Zeilenwert, Verteilungen nach Set/Seltenheit/Variante und SVG-Preisdiagramme. Alle lokal berechnet.
- **iPhone-Oberfläche:** Kamera-Overlay, touchfreundliche Buttons und horizontal scrollbarere untere Navigation für kleine Bildschirme (auch iPhone SE).
- **Backups:** JSON-Export enthält jetzt zusätzlich `priceHistory`; der Import älterer Backups ohne Historie bleibt möglich.

Alle Funktionen aus v4 bleiben erhalten: Einzel- und Serienscan mit Fotoauswahl, Katalogsuche, Duplikaterkennung, Alben, Preise, Filter, CSV-Import/-Export, JSON-Sicherung, Offline-PWA und Service-Worker-Caches. Datenbank `pokearchiv-collection` wird von Version 1 auf Version 2 migriert. Originaldaten werden bei der Migration **nicht gelöscht**.

## Installation

ZIP entpacken, Inhalt (nicht den umgebenden Ordner) ins Stammverzeichnis des vorhandenen GitHub-Repositories hochladen und committen. Unter Settings → Pages `main` und `/ (root)` aktivieren. HTTPS ist für Kamera und Service Worker erforderlich. In Safari über Teilen → Zum Home-Bildschirm installieren. Für Update nach Deployment App komplett schließen und neu öffnen, ggf. Safari-Seite aktualisieren, **nicht** Website-Daten löschen.

## Daten, Preisquellen und Grenzen

TCGdex liefert Katalogdaten/Bilder und ggf. Cardmarket-Euro-Preisfelder. Fehlende Preise werden nicht als null Euro in Statistiken gerechnet. Eigene Kartenwerte überschreiben den Marktpreis. Die Statistikhistorie speichert Tageswerte *ab erster Nutzung von v5*, keine rückwirkenden Marktpreise. Ohne Netz funktioniert die lokale Sammlung einschließlich Statistik und Historie; eine erste OCR-/Katalog-Abfrage braucht Internet. iOS kann lokalen Browser-Speicher löschen: JSON-Backups regelmäßig extern sichern. Kamera nur mit erteilter Berechtigung und HTTPS.


## Version 5.1 – Fehlerkorrekturen (5. November 2026)

- Suchtreffer sind jetzt jeweils ihrem Scan- oder Suchbereich zugeordnet; parallele Suchen überschreiben nicht länger dieselbe Trefferliste.
- Fällt der deutsche Katalog aus, wird die englische Suche versucht.
- Duplikate bei manuell erfassten Karten behalten vorhandene Notizen und Preisangaben.
- Preisaktualisierung zeigt API-Fehler an, statt bei einem Fehler unkontrolliert abzubrechen.
- Beim vollständigen Löschen der Sammlung wird auch die zugehörige Preisverlaufstabelle geleert.
- Beim CSV-Reimport bleiben vorhandene eigene Fotos zu identischen Eintrags-IDs erhalten.
- Die OCR-Bibliothek wird bei gleichzeitigen Anfragen nur einmal geladen. Wiederholte OCR-Tastendrücke lösen keine parallele Erkennung mehr aus.
- Texteingaben sind für iOS Safari mit mindestens 16 px angelegt, um ungewolltes Zoomverhalten zu reduzieren.
- Versionskennzeichen der PWA-Caches erneuert, sodass GitHub-Pages-Updates neu installiert werden.

**Testumfang:** JavaScript-Syntax, HTML-Element-Verknüpfungen, PWA-Dateien und Cache-Übereinstimmung sowie isolierte Tests für CSV-Escaping, CSV-Parsing und Preisberechnung erfolgreich. Vollständige Kamera-/OCR-End-to-End-Tests und iOS-Safari-Tests waren in der Testumgebung nicht möglich. Vor der Aktualisierung unbedingt JSON-Backup exportieren.


## Version 5.2 – Präzisere Erkennung (6. November 2026)

- Erkennung wertet nur noch den oberen Titelbereich für Namensvorschläge und den unteren Nummernbereich für die Kartennummer aus.
- Filter für gewöhnliche Begriffe aus Pokémon-Karten und Mindestvertrauen: bei unklarer Erkennung bleibt das Namensfeld leer, statt frei erfundene Namen zu übernehmen.
- Keine automatische Online-Suche unmittelbar nach Kameraaufnahme oder Serienscan: Namen und Nummern müssen zuerst kontrolliert und die Suche ausdrücklich gestartet werden.
- TCGdex-Suche filtert Kartennummern exakt über `localId` (statt Karten anderer Nummern als angebliche Treffer einzusortieren), fragt Deutsch und Englisch ab und dedupliziert Ergebnisse.
- Live-Kamera analysiert nur den innerhalb des Suchrahmens gezeigten Bereich statt des gesamten Bildhintergrunds.
- PWA-Cache-Version aktualisiert.

**Einschränkung:** Reine OCR kann komplexe illustrierte Karten nicht immer korrekt erkennen. Zur eindeutigen Bestimmung können Name + Nummer noch mehrere Sets ergeben: Ausgabe anhand des Kartenbildes bestätigen. Ohne Gerätefotos ist die Erkennungsqualität noch nicht auf realen iPhone-Aufnahmen validiert.
