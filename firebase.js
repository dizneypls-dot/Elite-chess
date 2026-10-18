/* Elite Chess: player accounts with Firebase (Authentication + Cloud Firestore), for elitechess.online and the
   Android app. Talks to Firebase's REST API directly (no SDK), so it works the same from the website and from the
   app's local page. Each player's progress is one document, users/<uid>, that only they can read and write
   (see firestore.rules). Turned on by window.GW_CONFIG.firebase = {apiKey, projectId} in config.js. */
(() => {
const GW = window.GW;
const CFG = (window.GW_CONFIG || {}).firebase || {};
const framed = !!(window.claude && typeof window.claude.use === 'function');
const enabled = !!(CFG.apiKey && CFG.projectId) && !framed;
// the local emulators replace these during testing
const AUTH = CFG.authUrl || 'https://identitytoolkit.googleapis.com';
const TOKEN = CFG.tokenUrl || 'https://securetoken.googleapis.com';
const DB = CFG.firestoreUrl || 'https://firestore.googleapis.com';

/* ---------- The signed-in user (kept on this device) ---------- */
const KEY = 'gw-fb';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { return null; } };
const save = u => { try { u ? localStorage.setItem(KEY, JSON.stringify(u)) : localStorage.removeItem(KEY); } catch (_) {} };
let user = load();

// Firebase error codes in plain words
const WORDS = {
  EMAIL_EXISTS: 'There is already an account with that email. Sign in instead.',
  EMAIL_NOT_FOUND: 'No account with that email. Create one instead.',
  INVALID_PASSWORD: 'That password doesn’t match.',
  INVALID_LOGIN_CREDENTIALS: 'The email or password is wrong.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  WEAK_PASSWORD: 'Passwords need at least 6 characters.',
  MISSING_PASSWORD: 'Please enter your password.',
  USER_DISABLED: 'This account has been switched off.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many tries. Please wait a few minutes and try again.',
  OPERATION_NOT_ALLOWED: 'Sign-in with this method isn’t switched on yet.',
  TOKEN_EXPIRED: 'Please sign in again.', USER_NOT_FOUND: 'Please sign in again.', INVALID_ID_TOKEN: 'Please sign in again.',
  CREDENTIAL_TOO_OLD_LOGIN_AGAIN: 'For safety, sign out and sign in again first.'
};
class FBError extends Error {
  constructor(code, msg){ super(msg || WORDS[code] || 'Something went wrong. Please try again.'); this.code = code; }
}
async function call(base, path, body, {form = false, token = null, method = 'POST'} = {}){
  let r;
  try {
    r = await fetch(`${base}${path}${path.includes('?') ? '&' : '?'}key=${encodeURIComponent(CFG.apiKey)}`, {
      method,
      headers: Object.assign({'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json'}, token ? {Authorization: 'Bearer ' + token} : {}),
      body: body == null ? undefined : form ? new URLSearchParams(body).toString() : JSON.stringify(body)
    });
  } catch (_) { throw new FBError('NETWORK', 'Can’t reach the server. Check your internet connection.'); }
  const data = await r.json().catch(() => ({}));
  if (!r.ok){
    // sign-in errors carry a code in the message ("WEAK_PASSWORD : …"); database errors carry a status (NOT_FOUND)
    const e = data.error || {};
    throw new FBError(base === DB ? e.status || String(r.status) : String(e.message || r.status).split(/[ :]/)[0]);
  }
  return data;
}
function signedIn(d, extra = {}){
  user = Object.assign({}, user && user.uid === d.localId ? user : {}, {
    uid: d.localId, email: d.email || '', idToken: d.idToken, refreshToken: d.refreshToken,
    exp: Date.now() + (+d.expiresIn || 3600) * 1000, provider: extra.provider || 'password', name: extra.name || d.displayName || ''
  });
  save(user);
  return user;
}
// A fresh token (they last an hour)
async function token(){
  if (!user) throw new FBError('TOKEN_EXPIRED');
  if (Date.now() < user.exp - 60000) return user.idToken;
  const d = await call(TOKEN, '/v1/token', {grant_type:'refresh_token', refresh_token:user.refreshToken}, {form:true});
  Object.assign(user, {idToken:d.id_token, refreshToken:d.refresh_token, exp: Date.now() + (+d.expires_in || 3600) * 1000});
  save(user);
  return user.idToken;
}

/* ---------- Accounts ---------- */
const signUp = async (email, password, name) => signedIn(await call(AUTH, '/v1/accounts:signUp', {email, password, returnSecureToken:true}), {name});
const signIn = async (email, password) => signedIn(await call(AUTH, '/v1/accounts:signInWithPassword', {email, password, returnSecureToken:true}));
// Google: the Google sign-in button gives an ID token, which Firebase turns into the player's account
const signInGoogle = async idToken => signedIn(await call(AUTH, '/v1/accounts:signInWithIdp',
  {postBody:`id_token=${encodeURIComponent(idToken)}&providerId=google.com`, requestUri: location.protocol.startsWith('http') ? location.origin : 'http://localhost', returnSecureToken:true, returnIdpCredential:true}), {provider:'google'});
const resetPassword = email => call(AUTH, '/v1/accounts:sendOobCode', {requestType:'PASSWORD_RESET', email});
function signOut(){ user = null; save(null); }

/* ---------- The player's saved progress: users/<uid> = {v, t, name, data (JSON text)} ---------- */
const docUrl = () => `/v1/projects/${encodeURIComponent(CFG.projectId)}/databases/(default)/documents/users/${encodeURIComponent(user.uid)}`;
async function getSave(){
  const tk = await token();
  try {
    const d = await call(DB, docUrl(), null, {token:tk, method:'GET'});
    const f = d.fields || {};
    return {t: +((f.t || {}).integerValue || 0), data: JSON.parse((f.data || {}).stringValue || '{}')};
  } catch (e){ if (e.code === 'NOT_FOUND') return null; throw e; }
}
async function putSave(data, t){
  const tk = await token();
  await call(DB, docUrl(), {fields:{v:{integerValue:'1'}, t:{integerValue:String(t)}, name:{stringValue:String((GW.profile && GW.profile.name) || '').slice(0, 20)}, data:{stringValue:JSON.stringify(data)}}}, {token:tk, method:'PATCH'});
}
// Removes the saved progress and the account itself
async function deleteAccount(){
  const tk = await token();
  try { await call(DB, docUrl(), null, {token:tk, method:'DELETE'}); } catch (_) {}
  await call(AUTH, '/v1/accounts:delete', {idToken:tk});
  signOut();
}

GW.FB = {enabled, user: () => user, signUp, signIn, signInGoogle, resetPassword, signOut, getSave, putSave, deleteAccount, FBError};
})();
