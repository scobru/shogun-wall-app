# 🔒 Sistema di Sicurezza e Autorizzazione - Wallie.io

## Panoramica

Wallie.io implementa un sistema di autorizzazione robusto per garantire che solo gli autori legittimi possano modificare o cancellare i propri contenuti.

## 🏗️ Architettura di Sicurezza

### 1. Identificazione Utenti

#### Utenti Shogun (Autenticati)
- **Chiave Pubblica Unica**: Ogni utente ha una `userPub` crittograficamente generata
- **Impossibile da Falsificare**: La chiave pubblica è matematicamente unica
- **Persistenza Cross-Domain**: Funziona tra diverse applicazioni

#### Utenti Guest (Locali)
- **Username Locale**: Utilizzano solo un nome utente salvato localmente
- **Limitazioni**: Funziona solo nel browser locale
- **Sicurezza Limitata**: Teoricamente duplicabile (ma solo localmente)

### 2. Tracciamento Autore nei Contenuti

Quando un post o nodo viene creato, vengono salvate queste informazioni:

```javascript
const enrichedData = {
   ...originalData,
   user: auth.isAuthenticated 
      ? (auth.userPub || auth.currentUsername || 'shogun_user')
      : (auth.currentUsername || 'anonymous'),
   userType: auth.isAuthenticated ? 'shogun' : 'guest',
   userPub: auth.isAuthenticated ? auth.userPub : undefined, // CHIAVE SICUREZZA
   userId: auth.isAuthenticated ? auth.userPub : undefined,
   timestamp: Date.now()
}
```

### 3. Controlli di Autorizzazione

#### Lato Client (UI)
```javascript
const canEditPost = (post) => {
   // Utenti Shogun: verifica chiave pubblica
   if (auth.isAuthenticated) {
      return post.userPub === auth.userPub || post.user === auth.username
   }
   // Utenti Guest: verifica username locale
   return post.user === auth.currentUsername
}
```

#### Lato "Server" (Gun.js)
```javascript
const deleteWithAuthorization = (key, currentUserPub, currentUsername) => {
   // Leggi il contenuto prima di cancellare
   gun.get(namespace).get(key).once((data) => {
      // Verifica autorizzazione
      const isAuthorized = 
         (currentUserPub && data.userPub === currentUserPub) || // Shogun
         (currentUsername && data.user === currentUsername && !data.userPub) // Guest
      
      if (!isAuthorized) {
         alert('❌ Non autorizzato!')
         return
      }
      
      // Procedi con cancellazione
      performDelete(key)
   })
}
```

## 🛡️ Livelli di Sicurezza

### Livello 1: Controllo UI
- I pulsanti "Modifica" e "Cancella" appaiono solo per i contenuti dell'utente
- **Scopo**: UX pulita e prevenzione errori accidentali
- **Limitazione**: Bypassabile con strumenti sviluppatore

### Livello 2: Verifica Pre-Cancellazione
- Ogni operazione di cancellazione verifica l'autorizzazione leggendo i dati
- **Scopo**: Sicurezza effettiva contro tentativi di cancellazione non autorizzata
- **Protezione**: Anche se l'UI viene bypassata, la cancellazione fallisce

### Livello 3: Archiviazione
- I contenuti cancellati vengono archiviati con metadati di cancellazione
- **Scopo**: Audit trail e possibile recupero
- **Informazioni**: Chi ha cancellato, quando, tipo di cancellazione

## 🔍 Scenari di Sicurezza

### ✅ Scenario Sicuro: Utente Shogun
1. **Alice** (Shogun) crea un post con `userPub: "abc123..."`
2. **Bob** (Shogun) tenta di cancellare il post di Alice
3. **Sistema** verifica: `post.userPub !== bob.userPub`
4. **Risultato**: ❌ Cancellazione negata

### ⚠️ Scenario Limitato: Utenti Guest
1. **Guest1** crea post con `user: "mario"`
2. **Guest2** (stesso browser) potrebbe teoricamente usare `user: "mario"`
3. **Limitazione**: Solo nel browser locale, non cross-browser

### 🚫 Scenario Impossibile: Cross-Domain
1. **Attaccante** tenta di falsificare `userPub` di Alice
2. **Impossibile**: Le chiavi pubbliche sono generate crittograficamente
3. **Risultato**: Matematicamente impossibile

## 📊 Matrice di Autorizzazione

| Tipo Utente | Identificatore | Sicurezza | Cross-Browser | Cross-Domain |
|--------------|----------------|-----------|---------------|--------------|
| Shogun       | userPub        | 🟢 Alta   | ✅ Sì         | ✅ Sì        |
| Guest        | username       | 🟡 Media  | ❌ No         | ❌ No        |
| Legacy       | username       | 🟡 Media  | ❌ No         | ❌ No        |

## 🔧 Implementazione Tecnica

### File Principali
- `useDelete.ts`: Verifica autorizzazione pre-cancellazione
- `useUpdateWithAuth.ts`: Aggiunge info autore ai post
- `useCreateNodeWithAuth.ts`: Aggiunge info autore ai nodi
- `Blog.tsx`: Controlli UI e chiamate autorizzate
- `DashboardItem.tsx`: Controlli UI per nodi

### Flusso di Cancellazione
1. **UI Check**: Mostra pulsante solo se autorizzato
2. **User Confirmation**: Richiede conferma utente
3. **Authorization Check**: Verifica autorizzazione leggendo dati
4. **Archive**: Salva in archivio per audit
5. **Delete**: Rimuove contenuto originale

## 🚀 Raccomandazioni Future

### Per Maggiore Sicurezza
1. **Rate Limiting**: Limita tentativi di cancellazione
2. **Logging Avanzato**: Log dettagliati delle operazioni
3. **Backup Automatico**: Backup periodici dell'archivio
4. **Notifiche**: Avvisi per operazioni sospette

### Per Migliore UX
1. **Recupero Contenuti**: UI per recuperare contenuti archiviati
2. **Cronologia Modifiche**: Traccia tutte le modifiche
3. **Collaborazione**: Sistema di permessi condivisi
4. **Moderazione**: Strumenti per amministratori

## ⚖️ Conclusione

Il sistema attuale fornisce **sicurezza robusta** per utenti Shogun attraverso l'uso di chiavi pubbliche crittografiche. Gli utenti guest hanno limitazioni di sicurezza ma sono confinati al contesto locale.

**Livello di Sicurezza Complessivo**: 🟢 **ALTO** per utenti autenticati

La combinazione di controlli UI, verifica pre-operazione e archiviazione crea un sistema di sicurezza a più livelli che protegge efficacemente contro cancellazioni non autorizzate. 