/* © 2026 Elite Chess. All rights reserved. Proprietary: no copying, reuse or AI training without written permission. See terms.html. */
/* Elite Chess settings for the stand-alone app (elitechess.online and the Android app).
   firebase: the Firebase project for player accounts (Firebase console → Project settings → Your apps → Web app).
   googleClientId: the OAuth client ID for "Continue with Google" (Firebase console → Authentication → Google).
   These values are meant to be public: the database rules (firestore.rules) are what keep each player's data private. */
window.GW_CONFIG = Object.assign({
  firebase: {apiKey: '', projectId: ''},
  googleClientId: ''
}, window.GW_CONFIG || {});
