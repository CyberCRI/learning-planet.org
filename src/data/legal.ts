/**
 * Legal pages content (privacy policy, cookies policy, legal notice), EN + FR.
 * Adapted July 2026 from the legacy WordPress pages to match this site's
 * actual practices: static hosting on GitHub Pages, self-hosted Matomo with
 * consent-gated cookies, no accounts, outbound Google Forms only, click-to-load
 * YouTube embeds. Slugs mirror the old URLs so inbound links keep working.
 */

import { localizedPath, type Locale } from '~/i18n/utils';

export type LegalSection = {
  heading?: string;
  html: string;
};

export type LegalPage = {
  title: string;
  metaDescription: string;
  updated: string;
  sections: LegalSection[];
};

export type LegalPageId = 'privacy-policy' | 'cookies-policy' | 'legal-notice';

const CONTACT = 'learningplanet@learningplanetinstitute.org';
const DPO = 'dpo@learningplanetinstitute.org';

const mail = (addr: string) => `<a href="mailto:${addr}">${addr}</a>`;

function privacyPolicy(locale: Locale): LegalPage {
  const cookiesLink = localizedPath('cookies-policy', locale);

  if (locale === 'fr') {
    return {
      title: 'Politique de confidentialité',
      metaDescription:
        'Comment le Learning Planet Institute protège vos données personnelles sur le site du LearningPlanet Festival : données collectées, finalités, durées de conservation et vos droits.',
      updated: 'Dernière mise à jour : juillet 2026',
      sections: [
        {
          html: `<p>Le site du LearningPlanet Festival est édité par le Learning Planet Institute. Nous nous engageons à protéger les données personnelles conformément à la loi n° 78-17 du 6 janvier 1978 (« Informatique et Libertés ») et au Règlement général sur la protection des données (RGPD, UE 2016/679).</p>`,
        },
        {
          heading: '1. Responsable de traitement',
          html: `<p>Learning Planet Institute<br />8 bis rue Charles V, 75004 Paris, France<br />Contact : ${mail(CONTACT)}<br />Délégué à la protection des données : ${mail(DPO)}</p>`,
        },
        {
          heading: '2. Données collectées',
          html: `<p>La consultation du site ne nécessite aucun compte ni aucune inscription. Les données traitées sont limitées à :</p>
<ul>
<li><strong>Données de navigation (statistiques)</strong> — nous utilisons Matomo, un outil de mesure d’audience open source que nous hébergeons nous-mêmes (analytics.learning-planet.org). Il collecte les pages visitées, le site de provenance, le type de navigateur et d’appareil, ainsi qu’une adresse IP anonymisée. Ces données restent sur nos propres serveurs et ne sont jamais vendues ni transmises à des tiers. Voir notre <a href="${cookiesLink}">politique de cookies</a>.</li>
<li><strong>Données que vous nous transmettez volontairement</strong> — lorsque vous remplissez un de nos formulaires (par exemple pour rester informé·e ou participer au festival) ou que vous nous écrivez par e-mail : nom, prénom, adresse e-mail, organisation, et toute information que vous choisissez de communiquer.</li>
<li><strong>Organisations partenaires</strong> — le nom, le logo et le site web des organisations partenaires sont affichés sur le site avec leur accord.</li>
</ul>`,
        },
        {
          heading: '3. Finalités du traitement',
          html: `<p>Les données sont collectées de manière loyale et licite pour :</p>
<ul>
<li>mesurer l’audience du site et améliorer son contenu et son fonctionnement ;</li>
<li>répondre à vos demandes et messages ;</li>
<li>gérer la participation au festival (formulaires) ;</li>
<li>présenter les organisations partenaires du festival ;</li>
<li>vous adresser des communications relatives au festival et à l’Institut, uniquement si vous vous y êtes inscrit·e.</li>
</ul>
<p>Ces traitements reposent sur votre consentement (cookies, communications) et sur l’intérêt légitime de l’Institut (mesure d’audience anonymisée, présentation des partenaires).</p>`,
        },
        {
          heading: '4. Cookies',
          html: `<p>Le site dépose un nombre très limité de cookies, et aucun cookie de mesure d’audience n’est déposé sans votre accord. Le détail figure dans notre <a href="${cookiesLink}">politique de cookies</a>, où vous pouvez modifier votre choix à tout moment.</p>`,
        },
        {
          heading: '5. Destinataires et sous-traitants',
          html: `<p>Certains services tiers interviennent dans le fonctionnement du site :</p>
<ul>
<li><strong>GitHub, Inc.</strong> (États-Unis) héberge le site (GitHub Pages) et traite à ce titre des journaux techniques de connexion. Ce transfert est encadré par des garanties appropriées conformément au RGPD.</li>
<li><strong>Google</strong> — nos formulaires d’inscription sont hébergés sur Google Forms : lorsque vous suivez un lien de formulaire, la politique de confidentialité de Google s’applique.</li>
<li><strong>YouTube (Google)</strong> — les rediffusions vidéo sont intégrées en mode confidentialité renforcée et ne se chargent qu’après un clic de votre part.</li>
<li>L’inscription à la newsletter s’effectue sur le site learningplanetinstitute.org, qui dispose de sa propre politique de confidentialité.</li>
</ul>
<p>Ces prestataires sont tenus à des obligations de sécurité et de confidentialité équivalentes aux nôtres.</p>`,
        },
        {
          heading: '6. Durées de conservation',
          html: `<p>Les données sont conservées pendant la durée nécessaire aux finalités décrites ci-dessus, puis supprimées ou anonymisées, dans le respect des durées légales de prescription applicables.</p>`,
        },
        {
          heading: '7. Vos droits',
          html: `<p>Conformément au RGPD, vous disposez des droits suivants sur vos données : accès, rectification, effacement, limitation du traitement, portabilité et opposition.</p>
<p>Pour exercer ces droits, écrivez à ${mail(DPO)}. Un justificatif d’identité pourra vous être demandé. Vous disposez également du droit d’introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>).</p>`,
        },
        {
          heading: '8. Sécurité',
          html: `<p>L’Institut met en œuvre des mesures techniques et organisationnelles raisonnables pour protéger les données : chiffrement des échanges (HTTPS), contrôle des accès, gestion restrictive des droits.</p>`,
        },
        {
          heading: '9. Évolution de la présente politique',
          html: `<p>Le Learning Planet Institute se réserve le droit de modifier la présente politique. Toute modification prend effet dès sa publication sur cette page.</p>`,
        },
      ],
    };
  }

  return {
    title: 'Privacy policy',
    metaDescription:
      'How the Learning Planet Institute protects your personal data on the LearningPlanet Festival website: what we collect, why, how long we keep it, and your rights.',
    updated: 'Last updated: July 2026',
    sections: [
      {
        html: `<p>The LearningPlanet Festival website is published by the Learning Planet Institute. We are committed to protecting personal data in accordance with French law No. 78-17 of 6 January 1978 (“Informatique et Libertés”) and the EU General Data Protection Regulation (GDPR, EU 2016/679).</p>`,
      },
      {
        heading: '1. Data controller',
        html: `<p>Learning Planet Institute<br />8 bis rue Charles V, 75004 Paris, France<br />Contact: ${mail(CONTACT)}<br />Data protection officer: ${mail(DPO)}</p>`,
      },
      {
        heading: '2. What data we collect',
        html: `<p>Browsing this site requires no account and no registration. The data we process is limited to:</p>
<ul>
<li><strong>Browsing data (analytics)</strong> — we use Matomo, an open-source audience-measurement tool that we host ourselves (analytics.learning-planet.org). It collects the pages you visit, the site you came from, your browser and device type, and an anonymised IP address. This data stays on our own servers and is never sold or shared with third parties. See our <a href="${cookiesLink}">cookies policy</a>.</li>
<li><strong>Data you volunteer</strong> — when you fill in one of our forms (for example to stay informed or take part in the festival) or write to us by email: first name, last name, email address, organisation, and anything else you choose to share.</li>
<li><strong>Partner organisations</strong> — the name, logo and website of partner organisations are displayed on the site with their agreement.</li>
</ul>`,
      },
      {
        heading: '3. Why we process this data',
        html: `<p>Data is collected lawfully and fairly, in order to:</p>
<ul>
<li>measure the site’s audience and improve its content and performance;</li>
<li>respond to your messages and enquiries;</li>
<li>manage participation in the festival (forms);</li>
<li>showcase the festival’s partner organisations;</li>
<li>send you communications about the festival and the Institute, only if you signed up for them.</li>
</ul>
<p>These processing activities rely on your consent (cookies, communications) and on the Institute’s legitimate interest (anonymised audience measurement, partner display).</p>`,
      },
      {
        heading: '4. Cookies',
        html: `<p>This site sets a very small number of cookies, and no analytics cookie is set without your consent. Full details are in our <a href="${cookiesLink}">cookies policy</a>, where you can change your choice at any time.</p>`,
      },
      {
        heading: '5. Third parties and processors',
        html: `<p>A few third-party services are involved in running this site:</p>
<ul>
<li><strong>GitHub, Inc.</strong> (United States) hosts the website (GitHub Pages) and processes technical connection logs in doing so. This transfer is covered by appropriate safeguards in line with the GDPR.</li>
<li><strong>Google</strong> — our registration forms are hosted on Google Forms: when you follow a form link, Google’s own privacy policy applies.</li>
<li><strong>YouTube (Google)</strong> — video replays are embedded in privacy-enhanced mode and only load after you click play.</li>
<li>Newsletter sign-up happens on learningplanetinstitute.org, which has its own privacy policy.</li>
</ul>
<p>These providers are bound by security and confidentiality obligations equivalent to our own.</p>`,
      },
      {
        heading: '6. How long we keep data',
        html: `<p>Data is kept only as long as necessary for the purposes described above, then deleted or anonymised, in accordance with applicable legal limitation periods.</p>`,
      },
      {
        heading: '7. Your rights',
        html: `<p>Under the GDPR you have the following rights over your data: access, rectification, erasure, restriction of processing, portability and objection.</p>
<p>To exercise them, write to ${mail(DPO)}. Proof of identity may be requested. You also have the right to lodge a complaint with the French data protection authority, the CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>).</p>`,
      },
      {
        heading: '8. Security',
        html: `<p>The Institute implements reasonable technical and organisational measures to protect data: encrypted connections (HTTPS), access control, and restricted access rights.</p>`,
      },
      {
        heading: '9. Changes to this policy',
        html: `<p>The Learning Planet Institute reserves the right to amend this policy. Changes take effect as soon as they are published on this page.</p>`,
      },
    ],
  };
}

function cookiesPolicy(locale: Locale): LegalPage {
  const privacyLink = localizedPath('privacy-policy', locale);

  if (locale === 'fr') {
    return {
      title: 'Politique de cookies',
      metaDescription:
        'Les cookies utilisés par le site du LearningPlanet Festival : mesure d’audience Matomo auto-hébergée soumise à votre consentement, et rien d’autre. Modifiez votre choix à tout moment.',
      updated: 'Dernière mise à jour : juillet 2026',
      sections: [
        {
          html: `<p>La présente politique explique quels cookies et technologies similaires sont utilisés sur ce site, et comment gérer vos préférences. Elle s’applique au site du LearningPlanet Festival. Pour en savoir plus sur le traitement de vos données, consultez notre <a href="${privacyLink}">politique de confidentialité</a>.</p>`,
        },
        {
          heading: 'Qu’est-ce qu’un cookie ?',
          html: `<p>Les cookies sont de petits fichiers texte enregistrés sur votre appareil lorsqu’un site se charge dans votre navigateur. Ils permettent au site de fonctionner correctement et de mémoriser vos préférences. Le stockage local (« local storage ») est une technologie voisine qui conserve des informations dans votre navigateur sans les transmettre à chaque requête.</p>`,
        },
        {
          heading: 'Comment nous utilisons les cookies',
          html: `<p>Ce site n’utilise que deux catégories de cookies : ceux qui mémorisent vos choix, et des cookies de mesure d’audience déposés par notre outil Matomo auto-hébergé — uniquement avec votre consentement. Aucun cookie publicitaire, de prospection commerciale ou de suivi inter-sites n’est utilisé.</p>`,
        },
        {
          heading: 'Cookies strictement nécessaires',
          html: `<table class="legal-table">
<thead><tr><th>Nom</th><th>Type</th><th>Durée</th><th>Finalité</th></tr></thead>
<tbody>
<tr><td>lpf_cookie_choice</td><td>stockage local</td><td>jusqu’à suppression</td><td>Mémorise votre réponse (accepter ou refuser) à la bannière de cookies afin qu’elle ne réapparaisse pas à chaque visite.</td></tr>
<tr><td>mtm_cookie_consent</td><td>cookie</td><td>30 jours</td><td>Déposé par Matomo uniquement après votre accord ; mémorise que le consentement a été donné.</td></tr>
</tbody>
</table>`,
        },
        {
          heading: 'Cookies de mesure d’audience (uniquement si vous acceptez)',
          html: `<table class="legal-table">
<thead><tr><th>Nom</th><th>Type</th><th>Durée</th><th>Finalité</th></tr></thead>
<tbody>
<tr><td>_pk_id</td><td>cookie</td><td>13 mois</td><td>Identifiant visiteur anonyme utilisé par Matomo pour reconnaître les visites répétées.</td></tr>
<tr><td>_pk_ses</td><td>cookie</td><td>30 minutes</td><td>Cookie de session de courte durée utilisé par Matomo pendant votre visite.</td></tr>
</tbody>
</table>
<p>Si vous refusez, votre visite est tout de même comptabilisée de manière anonyme, sans dépôt d’aucun cookie.</p>`,
        },
        {
          heading: 'Contenus tiers',
          html: `<p>Les rediffusions vidéo sont intégrées via YouTube en mode confidentialité renforcée (youtube-nocookie.com) : le lecteur ne se charge qu’après un clic de votre part. Une fois la lecture lancée, YouTube (Google) peut déposer ses propres cookies, régis par sa propre politique. Les vignettes de prévisualisation sont chargées depuis i.ytimg.com.</p>`,
        },
        {
          heading: 'Gérer vos préférences',
          html: `<p>Lors de votre première visite, une bannière vous permet d’accepter ou de refuser les cookies de mesure d’audience. Vous pouvez modifier votre choix à tout moment grâce au bouton « Gérer les cookies » ci-dessous ou en pied de page. Votre navigateur permet également de bloquer ou de supprimer les cookies ; pour en savoir plus, consultez <a href="https://fr.wikipedia.org/wiki/Cookie_(informatique)" target="_blank" rel="noopener">wikipedia.org</a>.</p>`,
        },
      ],
    };
  }

  return {
    title: 'Cookies policy',
    metaDescription:
      'The cookies used by the LearningPlanet Festival website: self-hosted Matomo analytics, set only with your consent — and nothing else. Change your choice at any time.',
    updated: 'Last updated: July 2026',
    sections: [
      {
        html: `<p>This policy explains which cookies and similar technologies are used on this site and how to manage your preferences. It applies to the LearningPlanet Festival website. For more about how we handle your data, see our <a href="${privacyLink}">privacy policy</a>.</p>`,
      },
      {
        heading: 'What are cookies?',
        html: `<p>Cookies are small text files stored on your device when a website loads in your browser. They help sites function properly and remember your preferences. Local storage is a similar technology that keeps information in your browser without sending it with every request.</p>`,
      },
      {
        heading: 'How we use cookies',
        html: `<p>This site uses only two kinds of cookies: those that remember your choices, and analytics cookies set by our self-hosted Matomo tool — only with your consent. No advertising, commercial-prospecting or cross-site tracking cookies are used.</p>`,
      },
      {
        heading: 'Strictly necessary',
        html: `<table class="legal-table">
<thead><tr><th>Name</th><th>Type</th><th>Duration</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td>lpf_cookie_choice</td><td>local storage</td><td>until deleted</td><td>Remembers your answer (accept or decline) to the cookie banner so it does not reappear on every visit.</td></tr>
<tr><td>mtm_cookie_consent</td><td>cookie</td><td>30 days</td><td>Set by Matomo only after you accept; remembers that consent was given.</td></tr>
</tbody>
</table>`,
      },
      {
        heading: 'Analytics (only if you accept)',
        html: `<table class="legal-table">
<thead><tr><th>Name</th><th>Type</th><th>Duration</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td>_pk_id</td><td>cookie</td><td>13 months</td><td>Anonymous visitor identifier used by Matomo to recognise returning visits.</td></tr>
<tr><td>_pk_ses</td><td>cookie</td><td>30 minutes</td><td>Short-lived session cookie used by Matomo during your visit.</td></tr>
</tbody>
</table>
<p>If you decline, your visit is still counted anonymously, without any cookie being set.</p>`,
      },
      {
        heading: 'Third-party content',
        html: `<p>Video replays are embedded via YouTube in privacy-enhanced mode (youtube-nocookie.com): the player only loads after you click play. Once playback starts, YouTube (Google) may set its own cookies, governed by its own policy. Preview thumbnails are loaded from i.ytimg.com.</p>`,
      },
      {
        heading: 'Managing your preferences',
        html: `<p>On your first visit, a banner lets you accept or decline analytics cookies. You can change your choice at any time using the “Manage cookies” button below or in the footer. Your browser also lets you block or delete cookies; to learn more, see <a href="https://en.wikipedia.org/wiki/HTTP_cookie" target="_blank" rel="noopener">wikipedia.org</a>.</p>`,
      },
    ],
  };
}

function legalNotice(locale: Locale): LegalPage {
  if (locale === 'fr') {
    return {
      title: 'Mentions légales',
      metaDescription:
        'Mentions légales du site du LearningPlanet Festival : éditeur, direction de la publication, hébergement, propriété intellectuelle et droit applicable.',
      updated: 'Dernière mise à jour : juillet 2026',
      sections: [
        {
          heading: 'Éditeur du site',
          html: `<p>Learning Planet Institute<br />8 bis rue Charles V, 75004 Paris, France<br />E-mail : ${mail(CONTACT)}</p>`,
        },
        {
          heading: 'Direction de la publication',
          html: `<p>L’équipe LearningPlanet Alliance<br />${mail(CONTACT)}</p>`,
        },
        {
          heading: 'Hébergement',
          html: `<p>Le site est hébergé par GitHub, Inc. (service GitHub Pages)<br />88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis<br /><a href="https://pages.github.com" target="_blank" rel="noopener">pages.github.com</a></p>
<p>La mesure d’audience (Matomo) est auto-hébergée par le Learning Planet Institute.</p>`,
        },
        {
          heading: 'Conception et réalisation',
          html: `<p>Design et développement : Learning Planet Institute.</p>`,
        },
        {
          heading: 'Propriété intellectuelle',
          html: `<p>Sauf mention contraire, les contenus éditoriaux (textes) de ce site sont mis à disposition sous licence <a href="https://creativecommons.org/licenses/by/4.0/deed.fr" target="_blank" rel="noopener">Creative Commons Attribution 4.0 International (CC BY 4.0)</a>, avec attribution : « LearningPlanet Festival — Learning Planet Institute ».</p>
<p>Cette licence ne s’applique pas aux logos et marques (Learning Planet Institute, LearningPlanet Festival, nom et emblème de l’UNESCO), ni aux contenus de tiers (logos des organisations partenaires, photographies des intervenant·es, vidéos), qui restent la propriété de leurs titulaires respectifs et ne peuvent être réutilisés sans leur autorisation.</p>`,
        },
        {
          heading: 'Liens externes',
          html: `<p>Le Learning Planet Institute n’exerce aucun contrôle sur les sites externes accessibles depuis ce site et décline toute responsabilité quant à leurs contenus, publicités, produits ou services.</p>`,
        },
        {
          heading: 'Droit applicable',
          html: `<p>Le présent site est régi par le droit français, notamment la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN).</p>`,
        },
      ],
    };
  }

  return {
    title: 'Legal notice',
    metaDescription:
      'Legal notice for the LearningPlanet Festival website: publisher, publication management, hosting, intellectual property and applicable law.',
    updated: 'Last updated: July 2026',
    sections: [
      {
        heading: 'Website publisher',
        html: `<p>Learning Planet Institute<br />8 bis rue Charles V, 75004 Paris, France<br />Email: ${mail(CONTACT)}</p>`,
      },
      {
        heading: 'Publication management',
        html: `<p>The LearningPlanet Alliance Team<br />${mail(CONTACT)}</p>`,
      },
      {
        heading: 'Hosting',
        html: `<p>The site is hosted by GitHub, Inc. (GitHub Pages)<br />88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States<br /><a href="https://pages.github.com" target="_blank" rel="noopener">pages.github.com</a></p>
<p>Audience measurement (Matomo) is self-hosted by the Learning Planet Institute.</p>`,
      },
      {
        heading: 'Design and development',
        html: `<p>Design and development: Learning Planet Institute.</p>`,
      },
      {
        heading: 'Intellectual property',
        html: `<p>Unless stated otherwise, the editorial content (texts) of this site is made available under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">Creative Commons Attribution 4.0 International licence (CC BY 4.0)</a>, with attribution: “LearningPlanet Festival — Learning Planet Institute”.</p>
<p>This licence does not extend to logos and trademarks (Learning Planet Institute, LearningPlanet Festival, the UNESCO name and emblem) or to third-party materials (partner organisation logos, speaker photographs, videos), which remain the property of their respective owners and may not be reused without their permission.</p>`,
      },
      {
        heading: 'External links',
        html: `<p>The Learning Planet Institute has no control over external websites accessible from this site and accepts no responsibility for their content, advertising, products or services.</p>`,
      },
      {
        heading: 'Applicable law',
        html: `<p>This site is governed by French law, in particular Law No. 2004-575 of 21 June 2004 on confidence in the digital economy (LCEN).</p>`,
      },
    ],
  };
}

export function getLegalPage(id: LegalPageId, locale: Locale): LegalPage {
  switch (id) {
    case 'privacy-policy':
      return privacyPolicy(locale);
    case 'cookies-policy':
      return cookiesPolicy(locale);
    case 'legal-notice':
      return legalNotice(locale);
  }
}
