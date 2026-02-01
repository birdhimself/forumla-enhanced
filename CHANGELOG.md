# Changelog

## v2.1.1 (2026-02-01)

- Abhängigkeiten aktualisiert
- Falsche Darstellung relativer Zeitstempel behoben, wenn der aktuelle Monat weniger Tage als der Tag des Zeitstempels hat

## v2.1.0 (2023-12-09)

- Neue Einstellung, um den Vollbild-Modus bei eingebetteten YouTube-Videos zu erlauben
  - Experimentell
  - Funktioniert in Firefox nicht bei nachgeladenen Posts (beispielsweise wenn Posts blockierter User nachträglich angezeigt werden)
- Der Commit Hash ist jetzt in den Debug-Informationen enthalten
- Alle Teile des injizierten Scripts werden jetzt zuverlässiger ausgeführt (zuvor wurden Teile des Scripts je nach Seitenaufruf/Geschwindigkeit nicht immer ausgeführt)

## v2.0.2 (2023-11-19)

- Berechtigung auf `*://*.forumla.de/*` wird erfragt, wenn der Zugriff nicht erlaubt ist
- Popup-Stying nachgebessert
  - Roboto Schriftart wird ordnungsgemäß eingebettet und verwendet
  - Größe von einigen Elementen korrigiert (bspw. Checkboxen)
  - Checkboxen werden in der Primärfarbe dargestellt
  - Schriftstil im Footer angepasst
- Ungenutzten Code entfernt

## v2.0.1 (2023-11-19)

- Erstes Firefox-Release
  - Inhaltlich identisch zu Version 2.0.0, mit Ergänzungen aufgrund des Review-Prozesses von Firefox Add-Ons

## v2.0.0 (2023-11-18)

- Vollständiges Rewrite der alten Version (0.3.0)
  - Mit allen Funktionen aus der alten Version, überarbeitet
  - Basierend auf [Oyle Enhanced](https://github.com/C0Nd3Mnd/oyle-enhanced)
- Verbessertes Verhalten bei Sprüngen zu Posts mit angepinntem Header (Beta)
- Unterstützung für die meisten Styles
  - Forumla 4.2 (Standard-Style)
  - Weihnachten 2022
    - inkl. Style-Fix für Schneeflocken
  - Forumla 4.2 Retro
    - inkl. Style-Fix für Buttons im Header
  - Forumla-Grey 4.1.12
    - Varianten ebenfalls unterstützt
  - Forumla-Eloquent 4.1.12
    - Varianten ebenfalls unterstützt
- Styles werden injiziert, bevor die Seite geladen ist (keine plötzlichen Layout-Veränderungen mehr)
- Umstellung auf Manifest v3
- Maximale Höhe von Bildern in Posts einstellbar
- Signaturbilder können ausgeblendet werden

## v0.3.0 (2019-01-15)

- Neue Funktion: 503-Fehler beim Laden von Vorschaubildern können umgangen werden, indem die Bilder nacheinander geladen werden
- Anpassung: Info aus dem Footer entfernt
- Anpassung: Obsoleten/ungenutzten Code entfernt

## v0.2.0 (2018-08-19)

- Neuer Browser: Firefox
- Changelog verlinkt
- Icons PNG-8 -> PNG-24
- `innerText` statt `innerHTML` wo möglich

## v0.1.0 (2018-07-21)

- Neue Funktion: Header anheften
- Neue Funktion: Kompakter Header
- Neue Funktion: Relative Zeitstempel
- Neue Funktion: Vor "Abonnement löschen" nachfragen
- Neue Funktion: Maximale Breite
