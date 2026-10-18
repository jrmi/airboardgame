import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./en.json";
import fr from "./fr.json";
import es from "./es.json";
import de from "./de.json";
import pt from "./pt.json";
import it from "./it.json";
import nl from "./nl.json";
import pl from "./pl.json";
import ja from "./ja.json";
import ko from "./ko.json";
import zh from "./zh.json";
import ru from "./ru.json";
import tr from "./tr.json";
import uk from "./uk.json";
import sv from "./sv.json";
import da from "./da.json";
import no from "./no.json";
import { SUPPORTED_LANGUAGES } from "./languages";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      de: { translation: de },
      pt: { translation: pt },
      it: { translation: it },
      nl: { translation: nl },
      pl: { translation: pl },
      ja: { translation: ja },
      ko: { translation: ko },
      zh: { translation: zh },
      ru: { translation: ru },
      tr: { translation: tr },
      uk: { translation: uk },
      sv: { translation: sv },
      da: { translation: da },
      no: { translation: no },
    },
    supportedLngs: SUPPORTED_LANGUAGES.map(({ code }) => code),
    debug: false,
    fallbackLng: "en",

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {},
  });

export default i18n;
