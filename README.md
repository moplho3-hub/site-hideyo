# Site de Hideyo Yoshimura

Site statique : que du HTML, du CSS et un fichier JavaScript. Aucun outil à
installer, aucune compilation. Vous ouvrez un fichier, vous modifiez, vous
enregistrez, c'est fini.

## Les fichiers

    index.html      page d'accueil
    work.html       la galerie et les quatre séries
    sessions.html   les formules, la carte de Kyoto, la FAQ
    about.html      la présentation et le matériel
    contact.html    le formulaire de demande
    style.css       toute la mise en forme, commentée par section
    site.js         langue, thème clair/sombre, filtres, visionneuse, formulaire
    assets/         les photos, déjà optimisées
    _headers        en-têtes de sécurité, lus par Cloudflare
    robots.txt      autorisation d'indexation

## Modifier un texte

Ouvrez la page, cherchez la phrase, changez-la. Attention : chaque phrase
existe en deux langues. L'anglais est le contenu de la balise, le japonais est
dans l'attribut `data-ja` juste avant. Changez les deux, sinon le bouton
日本語 affichera l'ancienne version.

    <p data-ja="LE JAPONAIS ICI">L'ANGLAIS ICI</p>

## Changer un prix

Trois endroits, à garder cohérents : `sessions.html` (les trois formules),
`index.html` (le rappel sur l'accueil) et `contact.html` (la liste déroulante
et l'encadré "Prices"). Le bloc `application/ld+json` en haut de chaque page
contient aussi les prix, c'est ce que lit Google.

## Ajouter une photo

1. Mettez le fichier dans `assets/`, en JPEG, 1400 px de large environ.
2. Dans `work.html`, copiez un bloc `<button class="tile">` existant, collez-le,
   changez le nom du fichier, la légende anglaise et la légende japonaise.
3. Changez `--r` : c'est la largeur divisée par la hauteur de VOTRE image.
   Une photo 1200x1800 donne `--r:0.667`. Si ce chiffre est faux, une bande
   vide apparaît sur un côté.

## Le jour où le domaine est acheté

Cherchez `VOTRE-DOMAINE.com` dans tout le projet et remplacez partout.
Cherchez aussi `ADRESSE-DE-HIDEYO@example.com` et mettez la vraie adresse.

## Brancher le formulaire

Dans `site.js`, tout en haut de la section formulaire, deux lignes :

    var ENDPOINT = '';   <- l'adresse Formspree, du type https://formspree.io/f/xxxxxxxx
    var MAILTO   = '';   <- l'adresse mail de Hideyo

Tant que `ENDPOINT` est vide, le formulaire prépare le message et propose au
visiteur de l'envoyer depuis sa propre application mail. Dès qu'il est rempli,
l'envoi se fait directement depuis le site.

## Mettre en ligne

Le site est publié par Cloudflare Pages. Si le dépôt GitHub est relié, il
suffit d'enregistrer et de pousser : Cloudflare republie tout seul en une
minute. Sinon, glissez le contenu du dossier dans Workers et Pages.
