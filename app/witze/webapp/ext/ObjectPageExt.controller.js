sap.ui.define([
  'sap/ui/core/mvc/ControllerExtension',
  'sap/m/MessageBox'
], function (ControllerExtension, MessageBox) {
  'use strict';

  // Der Server belegt einen neuen Witz beim Anlegen mit einem Vorschlag der
  // Chuck-Norris-API vor (srv/witz-service.js, before NEW). Eine Meldung aus
  // dieser Anfrage erschiene noch in der Liste, bevor die Objektseite offen
  // ist. Deshalb zeigt die Objektseite den Hinweis selbst - einmal je neuem
  // Entwurf, sobald er angezeigt wird.
  const ANZEIGE_FENSTER_MS = 60 * 1000;
  const angezeigt = new Set();

  return ControllerExtension.extend('de.espresso.cnj.witze.ext.ObjectPageExt', {
    override: {
      routing: {
        onAfterBinding: async function (kontext) {
          if (!kontext) return;
          const [ID, aktiv, hatAktiv, apiId, angelegt] = await Promise.all([
            kontext.requestProperty('ID'),
            kontext.requestProperty('IsActiveEntity'),
            kontext.requestProperty('HasActiveEntity'),
            kontext.requestProperty('apiId'),
            kontext.requestProperty('createdAt')
          ]);

          // Nur frisch angelegte Entwuerfe - nicht beim Bearbeiten eines
          // gespeicherten Witzes und nicht beim spaeteren Wiederoeffnen.
          const neu = aktiv === false && hatAktiv === false
            && Date.now() - Date.parse(angelegt) < ANZEIGE_FENSTER_MS;
          if (!neu || angezeigt.has(ID)) return;
          angezeigt.add(ID);

          const texte = this.base.getView().getModel('i18n').getResourceBundle();
          if (apiId) {
            MessageBox.information(texte.getText('VorschlagGeladen'), {
              title: texte.getText('VorschlagTitel')
            });
          } else {
            MessageBox.warning(texte.getText('VorschlagFehlt'), {
              title: texte.getText('VorschlagTitel')
            });
          }
        }
      }
    }
  });
});
