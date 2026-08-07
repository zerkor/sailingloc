import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

const content = {
  'mentions-legales': {
    title: 'Mentions légales',
    body: `
## Éditeur du site

Le présent site internet est édité par SailingLoc, société par actions simplifiée (SAS).

Dénomination sociale : SailingLoc

Statut juridique : Société par Actions Simplifiée (SAS)

Capital social : 50 000 €

Siège social :
12 Quai de la Marine
13002 Marseille
France

SIREN : 912 345 678

SIRET : 912 345 678 00014

RCS : Marseille 912 345 678

TVA intracommunautaire : FR 91 912345678

## Contact

**Email :** contact@sailingloc.fr

**Téléphone :** +33 6 12 34 56 78

## Directeur de publication

Monsieur Voisin, fondateur de SailingLoc.

## Hébergement

Le site est hébergé par Render.

https://render.com

## Base de données

Les données sont hébergées sur MongoDB Atlas.

## Nature fictive du projet

Ce site est un projet étudiant fictif. Aucun achat, paiement, contrat, réservation ou location réelle ne peut être effectué depuis SailingLoc. Les annonces, comptes, paiements et réservations présentés servent uniquement à la démonstration du MVP.

## Propriété intellectuelle

L'ensemble du contenu présent sur le site SailingLoc (textes, images, logos, éléments graphiques, vidéos, base de données, architecture, code source) est protégé par le Code de la propriété intellectuelle.

Toute reproduction totale ou partielle est interdite sans autorisation préalable.

## Données personnelles

Les données personnelles sont collectées uniquement dans le cadre de l'utilisation des services proposés.

Le traitement est réalisé conformément au Règlement Général sur la Protection des Données (RGPD).

Les utilisateurs disposent des droits suivants :

- droit d'accès
- droit de rectification
- droit d'effacement
- droit d'opposition
- droit à la limitation
- droit à la portabilité

Toute demande peut être adressée à contact@sailingloc.fr.

## Cookies

Le site utilise des cookies nécessaires au fonctionnement du service ainsi que des cookies de mesure d'audience.

L'utilisateur peut gérer ses préférences depuis le bandeau cookies ou depuis son navigateur.

## Responsabilité

SailingLoc met tout en œuvre afin d'assurer l'exactitude des informations diffusées.

Toutefois, aucune garantie ne peut être apportée concernant l'absence d'erreurs ou d'interruptions temporaires.
    `,
  },
  cgu: {
    title: "Conditions Générales d'Utilisation (CGU)",
    body: `
## Article 1 - Objet

Les présentes Conditions Générales d'Utilisation ont pour objet de définir les modalités d'accès et d'utilisation de la plateforme SailingLoc.

La plateforme permet la mise en relation entre propriétaires de bateaux et locataires souhaitant effectuer une réservation.

## Article 2 - Acceptation

Toute utilisation du site implique l'acceptation pleine et entière des présentes CGU.

## Article 3 - Création de compte

L'accès à certaines fonctionnalités nécessite la création d'un compte.

L'utilisateur garantit l'exactitude des informations communiquées.

Il est responsable de la confidentialité de ses identifiants.

## Article 4 - Services proposés

La plateforme permet notamment :

- consulter les annonces
- rechercher un bateau
- réserver une location
- effectuer un paiement sécurisé
- déposer un avis
- gérer son profil
- publier une annonce pour les propriétaires

## Article 5 - Obligations des utilisateurs

Les utilisateurs s'engagent à :

- fournir des informations exactes
- respecter les autres utilisateurs
- ne pas utiliser la plateforme à des fins frauduleuses
- respecter la législation française

## Article 6 - Obligations des propriétaires

Les propriétaires garantissent :

- être autorisés à louer leur bateau
- fournir des informations exactes
- maintenir leurs disponibilités à jour
- respecter la réglementation maritime

## Article 7 - Paiement

Les paiements sont réalisés via une solution sécurisée.

Les informations bancaires ne sont jamais stockées par SailingLoc.

## Article 8 - Avis

Les utilisateurs peuvent publier un avis après une location effectivement réalisée.

Les avis injurieux ou frauduleux pourront être supprimés.

## Article 9 - Suspension du compte

SailingLoc se réserve le droit de suspendre tout compte en cas :

- de fraude
- de non-respect des présentes CGU
- d'utilisation abusive

## Article 10 - Propriété intellectuelle

Tous les éléments du site restent la propriété exclusive de SailingLoc.

## Article 11 - Protection des données

Les traitements de données sont réalisés conformément au RGPD.

## Article 12 - Droit applicable

Les présentes CGU sont soumises au droit français.
    `,
  },
  cgv: {
    title: 'Conditions Générales de Vente (CGV)',
    body: `
## Article 1 - Objet

Les présentes Conditions Générales de Vente définissent les conditions applicables aux réservations réalisées sur SailingLoc.

## Article 2 - Services

SailingLoc permet :

- la réservation de bateaux entre particuliers
- la gestion des disponibilités
- le paiement sécurisé
- la gestion des comptes utilisateurs

## Article 3 - Tarifs

Les prix affichés sont indiqués en euros.

Ils sont déterminés par les propriétaires.

## Article 4 - Réservation

La réservation est considérée comme effective après :

- validation du propriétaire
- confirmation du paiement

## Article 5 - Paiement

Le règlement est effectué via Stripe.

Les données bancaires sont exclusivement traitées par Stripe conformément aux normes PCI-DSS.

## Article 6 - Annulation

Les conditions d'annulation sont précisées lors de chaque réservation.

Les remboursements éventuels sont effectués selon les conditions applicables.

## Article 7 - Responsabilité

Chaque propriétaire demeure responsable de son bateau.

Chaque locataire est responsable de l'utilisation qu'il en fait.

## Article 8 - Réclamations

Toute réclamation doit être adressée à contact@sailingloc.fr.

## Article 9 - Force majeure

Aucune des parties ne pourra être tenue responsable d'un événement indépendant de sa volonté empêchant l'exécution du contrat.

## Article 10 - Droit applicable

Les présentes CGV sont régies par le droit français.

En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
    `,
  },
  privacy: {
    title: 'Politique de confidentialité',
    body: `
## Données collectées

SailingLoc peut collecter les données suivantes dans le cadre de la démonstration : nom, prénom, email, téléphone et données de navigation.

## Utilisation des données

Vos données sont utilisées pour :

- gestion de votre compte
- traitement des réservations fictives
- amélioration de nos services
- communication par email

## Conservation

Vos données sont conservées pendant la durée nécessaire à la démonstration du projet.

## Vos droits

Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à contact@sailingloc.fr.

## Cookies

Voir notre politique des cookies.
    `,
  },
  cookies: {
    title: 'Politique des cookies',
    body: `
## Qu'est-ce qu'un cookie ?

Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur notre site.

## Cookies utilisés

**Cookies essentiels :** nécessaires au fonctionnement du site, notamment l'authentification et la session.

**Cookies analytiques :** utilisés via Google Tag Manager pour comprendre l'utilisation du site.

## Gestion des cookies

Vous pouvez configurer votre navigateur pour refuser les cookies. Cela peut affecter certaines fonctionnalités du site.

## Durée de conservation

Les cookies essentiels sont conservés pendant la durée de votre session ou jusqu'à 30 jours.
    `,
  },
};

const LegalPage = () => {
  const { slug } = useParams();
  const page = content[slug];

  if (!page) {
    return (
      <div className="container-max section-padding text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Page introuvable</h1>
        <Link to="/" className="btn-primary">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const renderContent = (text) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="mb-2 mt-6 text-xl font-bold text-gray-900">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="font-semibold text-gray-800">
            {line.slice(2, -2)}
          </p>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4 text-gray-600">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === '') return <br key={i} />;
      return (
        <p key={i} className="leading-relaxed text-gray-600">
          {line}
        </p>
      );
    });

  return (
    <div className="container-max section-padding max-w-3xl">
      <Breadcrumb className="site-breadcrumb--card" items={[{ label: 'Pages légales' }, { label: page.title }]} />
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:underline">
        <ArrowLeft size={14} /> Retour à l'accueil
      </Link>
      <h1 className="mb-8 mt-4 text-3xl font-bold text-gray-900">{page.title}</h1>
      <div className="prose max-w-none space-y-1">{renderContent(page.body)}</div>
    </div>
  );
};

export default LegalPage;
