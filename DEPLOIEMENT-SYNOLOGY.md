# Déploiement Synology DS218+

## Architecture finale

```
Internet (HTTPS 443)
    ↓
Ta box (redirection port 443 → NAS)
    ↓
DSM Reverse Proxy (SSL Let's Encrypt)
    ↓
Container frontend :8080 (nginx)
    ↓
Container backend :3001 (Node.js) — réseau interne Docker uniquement
    ↓
Volume Docker — congelo.db (SQLite)
```

---

## Étape 1 — DDNS Synology (nom de domaine gratuit)

1. DSM → **Panneau de configuration** → **Connectivité externe** → **DDNS**
2. Cliquer **Ajouter**
3. Fournisseur : `Synology`
4. Nom d'hôte : choisir un nom (ex. `congelo.synology.me`)
5. Activer **Heartbeat** → **OK**

Tu obtiens une URL fixe même si ton IP change.

---

## Étape 2 — Ouverture du port sur ta box

Dans l'interface de ta box (souvent `192.168.1.1`) :

- **Redirection de port / NAT** :
  - Port externe : `443`
  - IP interne : IP fixe du NAS (ex. `192.168.1.x`)
  - Port interne : `443`
  - Protocole : TCP

> Conseil : attribue une IP fixe au NAS dans ta box (réservation DHCP par adresse MAC).

---

## Étape 3 — Certificat SSL Let's Encrypt dans DSM

1. DSM → **Panneau de configuration** → **Sécurité** → **Certificat**
2. **Ajouter** → *Obtenir un certificat auprès de Let's Encrypt*
3. Nom de domaine : `congelo.synology.me` (ton DDNS de l'étape 1)
4. Email : ton email
5. → **OK** — DSM obtient et renouvelle automatiquement le certificat

---

## Étape 4 — Déployer l'app avec Container Manager

### 4a. Copier les fichiers sur le NAS

Via **File Station** ou SSH, crée un dossier et copie le projet :
```
/volume1/docker/congelo/
```

Ou clone directement depuis le NAS via SSH :
```bash
ssh ton-user@192.168.1.x
cd /volume1/docker
git clone https://github.com/Volengare-Git/frozen.git congelo
```

### 4b. Lancer avec Container Manager

1. DSM → **Container Manager** → **Projet**
2. **Créer** → *Créer un projet docker-compose*
3. Chemin : `/volume1/docker/congelo`
4. → **Suivant** → **Terminé**

Container Manager détecte le `docker-compose.yml` et construit les deux images.

> La première fois, le build prend 2-5 minutes (téléchargement des images Node/nginx).

---

## Étape 5 — Reverse Proxy DSM

1. DSM → **Panneau de configuration** → **Portail de connexion** → **Avancé** → **Reverse Proxy**
2. **Créer** :

| Champ | Valeur |
|---|---|
| Nom | Congelo |
| Protocole source | HTTPS |
| Nom d'hôte source | `congelo.synology.me` |
| Port source | `443` |
| Protocole destination | HTTP |
| Nom d'hôte destination | `localhost` |
| Port destination | `8080` |

3. Onglet **En-tête personnalisé** → **Créer** → WebSocket (recommandé)
4. → **Enregistrer**

---

## Étape 6 — Vérification

Ouvre `https://congelo.synology.me` depuis :
- Ton PC
- Ton téléphone (réseau mobile, pas Wi-Fi — pour tester l'accès externe)

### Installer sur l'écran d'accueil (PWA)

**Android (Chrome)** : menu ⋮ → *Ajouter à l'écran d'accueil*

**iOS (Safari)** : bouton Partager → *Sur l'écran d'accueil*

---

## Mises à jour futures

```bash
# Sur le NAS via SSH
cd /volume1/docker/congelo
git pull
```

Puis dans Container Manager → Projet → **Congelo** → **Arrêter** → **Construire** → **Démarrer**.

---

## Sauvegarde des données

La base SQLite est dans un volume Docker nommé `congelo-data`.

Pour sauvegarder manuellement :
```bash
docker run --rm -v congelo_congelo-data:/data -v /volume1/backup:/backup alpine \
  tar czf /backup/congelo-$(date +%Y%m%d).tar.gz -C /data .
```

Idéalement, ajouter cette commande dans **Planificateur de tâches DSM** (hebdomadaire).
