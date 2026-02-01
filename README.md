# Forumla Enhanced

[![](https://img.shields.io/chrome-web-store/v/ilplcmogdmdceejlebllhjfigkamngig?style=for-the-badge)](https://chromewebstore.google.com/detail/forumla-enhanced/ilplcmogdmdceejlebllhjfigkamngig)
[![](https://img.shields.io/amo/v/forumla-enhanced?style=for-the-badge)](https://addons.mozilla.org/firefox/addon/forumla-enhanced/)

Inoffizielles Browser Add-On für [forumla.de](https://forumla.de).

![Screenshot](./screenshot.png)

## Build

### Voraussetzungen _Requirements_

- Node.js >= 24
- npm >= 11

### Schritte _Steps_

Repository klonen:\
_Clone this repository:_

```sh
# HTTPS
git clone https://github.com/birdhimself/forumla-enhanced.git

# SSH
git clone git@github.com:birdhimself/forumla-enhanced.git
```

Pakete installieren:\
_Install packages:_

```sh
npm install
```

Build ausführen:\
_Run build:_

```sh
npm run build
```

Hierbei werden zwei Ordner erzeugt, wobei `dist` den Build für Chromium-basierte Browser enthält und `dist-firefox` den angepassten Build für Firefox.\
_This will create two folders, where `dist` contains the build for Chromium based browsers and `dist-firefox` contains a slightly modified build for Firefox._
