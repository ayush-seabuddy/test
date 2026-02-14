import { t } from "i18next";

  // Dropdown Options
 export const GENDER = [
    { label: t('genderOptions.male'), value: t('genderOptions.male') },
    { label: t('genderOptions.female'), value: t('genderOptions.female') },
    { label: t('genderOptions.other'), value: t('genderOptions.other') },
  ];

 export const EXPERIENCE = [
    { label: t('experienceOptions.0_1'), value: t('experienceOptions.0_1') },
    { label: t('experienceOptions.2_5'), value: t('experienceOptions.2_5') },
    { label: t('experienceOptions.5_plus'), value: t('experienceOptions.5_plus') },
  ];

 export const RELATIONSHIP = [
    { label: t('relationshipOptions.single'), value: t('relationshipOptions.single') },
    { label: t('relationshipOptions.married'), value: t('relationshipOptions.married') },
    { label: t('relationshipOptions.divorced'), value: t('relationshipOptions.divorced') },
    { label: t('relationshipOptions.widowed'), value: t('relationshipOptions.widowed') },
  ];

 export const ETHNICITY = [
    { label: t('ethnicityOptions.asian'), value: t('ethnicityOptions.asian') },
    { label: t('ethnicityOptions.black'), value: t('ethnicityOptions.black') },
    { label: t('ethnicityOptions.white'), value: t('ethnicityOptions.white') },
    { label: t('ethnicityOptions.latino'), value: t('ethnicityOptions.latino') },
    { label: t('ethnicityOptions.mena'), value: t('ethnicityOptions.mena') },
    { label: t('ethnicityOptions.native'), value: t('ethnicityOptions.native') },
    { label: t('ethnicityOptions.pacific'), value: t('ethnicityOptions.pacific') },
    { label: t('ethnicityOptions.mixed'), value: t('ethnicityOptions.mixed') },
  ];

 export const RELIGION = [
    { label: t('religionOptions.buddhism'), value: t('religionOptions.buddhism') },
    { label: t('religionOptions.christianity'), value: t('religionOptions.christianity') },
    { label: t('religionOptions.hinduism'), value: t('religionOptions.hinduism') },
    { label: t('religionOptions.islam'), value: t('religionOptions.islam') },
    { label: t('religionOptions.judaism'), value: t('religionOptions.judaism') },
    { label: t('religionOptions.sikhism'), value: t('religionOptions.sikhism') },
    { label: t('religionOptions.jainism'), value: t('religionOptions.jainism') },
    { label: t('religionOptions.zoroastrianism'), value: t('religionOptions.zoroastrianism') },
    { label: t('religionOptions.taoism'), value: t('religionOptions.taoism') },
    { label: t('religionOptions.shinto'), value: t('religionOptions.shinto') },
    { label: t('religionOptions.other'), value: t('religionOptions.other') },
    { label: t('religionOptions.none'), value: t('religionOptions.none') },
  ];

 export const HEALTH_OPTIONS = [
    { label: t('healthOptions.none'), value: t('healthOptions.none') },
    { label: t('healthOptions.hypertension'), value: t('healthOptions.hypertension') },
    { label: t('healthOptions.diabetes'), value: t('healthOptions.diabetes') },
    { label: t('healthOptions.anxiety'), value: t('healthOptions.anxiety') },
    { label: t('healthOptions.depression'), value: t('healthOptions.depression') },
    { label: t('healthOptions.other'), value: t('healthOptions.other') },
    { label: t('healthOptions.prefer_no'), value: t('healthOptions.prefer_no') },
  ];

 export const SMOKING_OPTIONS = [
    { label: t('smokingOptions.no'), value: t('smokingOptions.no') },
    { label: t('smokingOptions.occasional'), value: t('smokingOptions.occasional') },
    { label: t('smokingOptions.regular'), value: t('smokingOptions.regular') },
    { label: t('smokingOptions.quit'), value: t('smokingOptions.quit') },
    { label: t('smokingOptions.prefer_no'), value: t('smokingOptions.prefer_no') },
  ];

 export const ALCOHOL_OPTIONS = [
    { label: t('alcoholOptions.no'), value: t('alcoholOptions.no') },
    { label: t('alcoholOptions.occasional'), value: t('alcoholOptions.occasional') },
    { label: t('alcoholOptions.regular'), value: t('alcoholOptions.regular') },
    { label: t('alcoholOptions.avoid'), value: t('alcoholOptions.avoid') },
    { label: t('alcoholOptions.prefer_no'), value: t('alcoholOptions.prefer_no') },
  ];

  // NEW: Activity Level Dropdown
 export const ACTIVITY_OPTIONS = [
    { label: t('activityOptions.inactive'), value: t('activityOptions.inactive') },
    { label: t('activityOptions.light_active'), value: t('activityOptions.light_active') },
    { label: t('activityOptions.moderate_active'), value: t('activityOptions.moderate_active') },
    { label: t('activityOptions.very_active'), value: t('activityOptions.very_active') },
    { label: t('activityOptions.prefer_no'), value: t('activityOptions.prefer_no') },
  ];

 export const SOCIAL_OPTIONS = [
    { label: t('socialOptions.connected'), value: t('socialOptions.connected') },
    { label: t('socialOptions.isolated'), value: t('socialOptions.isolated') },
    { label: t('socialOptions.alone'), value: t('socialOptions.alone') },
  ];

 export const HOBBIES_OPTIONS = [

    { label: t('hobbiesOptions.art'), value: t('hobbiesOptions.art') },
    { label: t('hobbiesOptions.music'), value: t('hobbiesOptions.music') },
    { label: t('hobbiesOptions.photo'), value: t('hobbiesOptions.photo') },
    { label: t('hobbiesOptions.dance'), value: t('hobbiesOptions.dance') },
    { label: t('hobbiesOptions.yoga'), value: t('hobbiesOptions.yoga') },
    { label: t('hobbiesOptions.gym'), value: t('hobbiesOptions.gym') },
    { label: t('hobbiesOptions.gaming'), value: t('hobbiesOptions.gaming') },
    { label: t('hobbiesOptions.reading'), value: t('hobbiesOptions.reading') },
    { label: t('hobbiesOptions.movies'), value: t('hobbiesOptions.movies') },
    { label: t('hobbiesOptions.cooking'), value: t('hobbiesOptions.cooking') },
    { label: t('hobbiesOptions.sports'), value: t('hobbiesOptions.sports') },
    { label: t('hobbiesOptions.meditation'), value: t('hobbiesOptions.meditation') },
  ];

 export const FAV_ACTIVITY_OPTIONS = [
    { label: t('fav_activityOptions.movie'), value: t('fav_activityOptions.movie') },
    { label: t('fav_activityOptions.gym'), value: t('fav_activityOptions.gym') },
    { label: t('fav_activityOptions.karaoke'), value: t('fav_activityOptions.karaoke') },
    { label: t('fav_activityOptions.games'), value: t('fav_activityOptions.games') },
    { label: t('fav_activityOptions.jam'), value: t('fav_activityOptions.jam') },
    { label: t('fav_activityOptions.meditation'), value: t('fav_activityOptions.meditation') },
    { label: t('fav_activityOptions.cook'), value: t('fav_activityOptions.cook') },
    { label: t('fav_activityOptions.sports'), value: t('fav_activityOptions.sports') },
    { label: t('fav_activityOptions.drinks'), value: t('fav_activityOptions.drinks') },
  ];