/**
 * Full ISO 3166 country list used by the Pavel checkout modal's country
 * selector. `code` is the ISO 3166-1 alpha-2 code; `name` is the display label;
 * `tz` is a representative IANA timezone used to convert the fixed workshop
 * start instant (WORKSHOP.startUtc) into the attendee's local time.
 *
 * NOTE: for countries that span multiple zones (US, Canada, Australia, Russia,
 * Brazil, …) `tz` is the capital / most-populous zone — a sensible default, not
 * a per-user exact zone. Formatting is wrapped in a try/catch at the call site,
 * so an unsupported zone falls back to the default IST label rather than throwing.
 */
export interface Country {
  code: string;
  name: string;
  /** International dialing code, e.g. "+91". */
  dialCode: string;
  tz: string;
}

export const COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan", dialCode: "+93", tz: "Asia/Kabul" },
  { code: "AX", name: "Åland Islands", dialCode: "+358", tz: "Europe/Helsinki" },
  { code: "AL", name: "Albania", dialCode: "+355", tz: "Europe/Tirane" },
  { code: "DZ", name: "Algeria", dialCode: "+213", tz: "Africa/Algiers" },
  { code: "AS", name: "American Samoa", dialCode: "+1", tz: "Pacific/Pago_Pago" },
  { code: "AD", name: "Andorra", dialCode: "+376", tz: "Europe/Andorra" },
  { code: "AO", name: "Angola", dialCode: "+244", tz: "Africa/Luanda" },
  { code: "AI", name: "Anguilla", dialCode: "+1", tz: "America/Anguilla" },
  { code: "AQ", name: "Antarctica", dialCode: "+672", tz: "Antarctica/McMurdo" },
  { code: "AG", name: "Antigua and Barbuda", dialCode: "+1", tz: "America/Antigua" },
  { code: "AR", name: "Argentina", dialCode: "+54", tz: "America/Argentina/Buenos_Aires" },
  { code: "AM", name: "Armenia", dialCode: "+374", tz: "Asia/Yerevan" },
  { code: "AW", name: "Aruba", dialCode: "+297", tz: "America/Aruba" },
  { code: "AU", name: "Australia", dialCode: "+61", tz: "Australia/Sydney" },
  { code: "AT", name: "Austria", dialCode: "+43", tz: "Europe/Vienna" },
  { code: "AZ", name: "Azerbaijan", dialCode: "+994", tz: "Asia/Baku" },
  { code: "BS", name: "Bahamas", dialCode: "+1", tz: "America/Nassau" },
  { code: "BH", name: "Bahrain", dialCode: "+973", tz: "Asia/Bahrain" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", tz: "Asia/Dhaka" },
  { code: "BB", name: "Barbados", dialCode: "+1", tz: "America/Barbados" },
  { code: "BY", name: "Belarus", dialCode: "+375", tz: "Europe/Minsk" },
  { code: "BE", name: "Belgium", dialCode: "+32", tz: "Europe/Brussels" },
  { code: "BZ", name: "Belize", dialCode: "+501", tz: "America/Belize" },
  { code: "BJ", name: "Benin", dialCode: "+229", tz: "Africa/Porto-Novo" },
  { code: "BM", name: "Bermuda", dialCode: "+1", tz: "Atlantic/Bermuda" },
  { code: "BT", name: "Bhutan", dialCode: "+975", tz: "Asia/Thimphu" },
  { code: "BO", name: "Bolivia", dialCode: "+591", tz: "America/La_Paz" },
  { code: "BQ", name: "Bonaire, Sint Eustatius and Saba", dialCode: "+599", tz: "America/Curacao" },
  { code: "BA", name: "Bosnia and Herzegovina", dialCode: "+387", tz: "Europe/Sarajevo" },
  { code: "BW", name: "Botswana", dialCode: "+267", tz: "Africa/Gaborone" },
  { code: "BV", name: "Bouvet Island", dialCode: "+47", tz: "UTC" },
  { code: "BR", name: "Brazil", dialCode: "+55", tz: "America/Sao_Paulo" },
  { code: "IO", name: "British Indian Ocean Territory", dialCode: "+246", tz: "Indian/Chagos" },
  { code: "BN", name: "Brunei Darussalam", dialCode: "+673", tz: "Asia/Brunei" },
  { code: "BG", name: "Bulgaria", dialCode: "+359", tz: "Europe/Sofia" },
  { code: "BF", name: "Burkina Faso", dialCode: "+226", tz: "Africa/Ouagadougou" },
  { code: "BI", name: "Burundi", dialCode: "+257", tz: "Africa/Bujumbura" },
  { code: "CV", name: "Cabo Verde", dialCode: "+238", tz: "Atlantic/Cape_Verde" },
  { code: "KH", name: "Cambodia", dialCode: "+855", tz: "Asia/Phnom_Penh" },
  { code: "CM", name: "Cameroon", dialCode: "+237", tz: "Africa/Douala" },
  { code: "CA", name: "Canada", dialCode: "+1", tz: "America/Toronto" },
  { code: "KY", name: "Cayman Islands", dialCode: "+1", tz: "America/Cayman" },
  { code: "CF", name: "Central African Republic", dialCode: "+236", tz: "Africa/Bangui" },
  { code: "TD", name: "Chad", dialCode: "+235", tz: "Africa/Ndjamena" },
  { code: "CL", name: "Chile", dialCode: "+56", tz: "America/Santiago" },
  { code: "CN", name: "China", dialCode: "+86", tz: "Asia/Shanghai" },
  { code: "CX", name: "Christmas Island", dialCode: "+61", tz: "Indian/Christmas" },
  { code: "CC", name: "Cocos (Keeling) Islands", dialCode: "+61", tz: "Indian/Cocos" },
  { code: "CO", name: "Colombia", dialCode: "+57", tz: "America/Bogota" },
  { code: "KM", name: "Comoros", dialCode: "+269", tz: "Indian/Comoro" },
  { code: "CG", name: "Congo", dialCode: "+242", tz: "Africa/Brazzaville" },
  { code: "CD", name: "Congo, Democratic Republic of the", dialCode: "+243", tz: "Africa/Kinshasa" },
  { code: "CK", name: "Cook Islands", dialCode: "+682", tz: "Pacific/Rarotonga" },
  { code: "CR", name: "Costa Rica", dialCode: "+506", tz: "America/Costa_Rica" },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "+225", tz: "Africa/Abidjan" },
  { code: "HR", name: "Croatia", dialCode: "+385", tz: "Europe/Zagreb" },
  { code: "CU", name: "Cuba", dialCode: "+53", tz: "America/Havana" },
  { code: "CW", name: "Curaçao", dialCode: "+599", tz: "America/Curacao" },
  { code: "CY", name: "Cyprus", dialCode: "+357", tz: "Asia/Nicosia" },
  { code: "CZ", name: "Czechia", dialCode: "+420", tz: "Europe/Prague" },
  { code: "DK", name: "Denmark", dialCode: "+45", tz: "Europe/Copenhagen" },
  { code: "DJ", name: "Djibouti", dialCode: "+253", tz: "Africa/Djibouti" },
  { code: "DM", name: "Dominica", dialCode: "+1", tz: "America/Dominica" },
  { code: "DO", name: "Dominican Republic", dialCode: "+1", tz: "America/Santo_Domingo" },
  { code: "EC", name: "Ecuador", dialCode: "+593", tz: "America/Guayaquil" },
  { code: "EG", name: "Egypt", dialCode: "+20", tz: "Africa/Cairo" },
  { code: "SV", name: "El Salvador", dialCode: "+503", tz: "America/El_Salvador" },
  { code: "GQ", name: "Equatorial Guinea", dialCode: "+240", tz: "Africa/Malabo" },
  { code: "ER", name: "Eritrea", dialCode: "+291", tz: "Africa/Asmara" },
  { code: "EE", name: "Estonia", dialCode: "+372", tz: "Europe/Tallinn" },
  { code: "SZ", name: "Eswatini", dialCode: "+268", tz: "Africa/Mbabane" },
  { code: "ET", name: "Ethiopia", dialCode: "+251", tz: "Africa/Addis_Ababa" },
  { code: "FK", name: "Falkland Islands (Malvinas)", dialCode: "+500", tz: "Atlantic/Stanley" },
  { code: "FO", name: "Faroe Islands", dialCode: "+298", tz: "Atlantic/Faroe" },
  { code: "FJ", name: "Fiji", dialCode: "+679", tz: "Pacific/Fiji" },
  { code: "FI", name: "Finland", dialCode: "+358", tz: "Europe/Helsinki" },
  { code: "FR", name: "France", dialCode: "+33", tz: "Europe/Paris" },
  { code: "GF", name: "French Guiana", dialCode: "+594", tz: "America/Cayenne" },
  { code: "PF", name: "French Polynesia", dialCode: "+689", tz: "Pacific/Tahiti" },
  { code: "TF", name: "French Southern Territories", dialCode: "+262", tz: "Indian/Kerguelen" },
  { code: "GA", name: "Gabon", dialCode: "+241", tz: "Africa/Libreville" },
  { code: "GM", name: "Gambia", dialCode: "+220", tz: "Africa/Banjul" },
  { code: "GE", name: "Georgia", dialCode: "+995", tz: "Asia/Tbilisi" },
  { code: "DE", name: "Germany", dialCode: "+49", tz: "Europe/Berlin" },
  { code: "GH", name: "Ghana", dialCode: "+233", tz: "Africa/Accra" },
  { code: "GI", name: "Gibraltar", dialCode: "+350", tz: "Europe/Gibraltar" },
  { code: "GR", name: "Greece", dialCode: "+30", tz: "Europe/Athens" },
  { code: "GL", name: "Greenland", dialCode: "+299", tz: "America/Nuuk" },
  { code: "GD", name: "Grenada", dialCode: "+1", tz: "America/Grenada" },
  { code: "GP", name: "Guadeloupe", dialCode: "+590", tz: "America/Guadeloupe" },
  { code: "GU", name: "Guam", dialCode: "+1", tz: "Pacific/Guam" },
  { code: "GT", name: "Guatemala", dialCode: "+502", tz: "America/Guatemala" },
  { code: "GG", name: "Guernsey", dialCode: "+44", tz: "Europe/London" },
  { code: "GN", name: "Guinea", dialCode: "+224", tz: "Africa/Conakry" },
  { code: "GW", name: "Guinea-Bissau", dialCode: "+245", tz: "Africa/Bissau" },
  { code: "GY", name: "Guyana", dialCode: "+592", tz: "America/Guyana" },
  { code: "HT", name: "Haiti", dialCode: "+509", tz: "America/Port-au-Prince" },
  { code: "HM", name: "Heard Island and McDonald Islands", dialCode: "+672", tz: "UTC" },
  { code: "VA", name: "Holy See", dialCode: "+39", tz: "Europe/Rome" },
  { code: "HN", name: "Honduras", dialCode: "+504", tz: "America/Tegucigalpa" },
  { code: "HK", name: "Hong Kong", dialCode: "+852", tz: "Asia/Hong_Kong" },
  { code: "HU", name: "Hungary", dialCode: "+36", tz: "Europe/Budapest" },
  { code: "IS", name: "Iceland", dialCode: "+354", tz: "Atlantic/Reykjavik" },
  { code: "IN", name: "India", dialCode: "+91", tz: "Asia/Kolkata" },
  { code: "ID", name: "Indonesia", dialCode: "+62", tz: "Asia/Jakarta" },
  { code: "IR", name: "Iran", dialCode: "+98", tz: "Asia/Tehran" },
  { code: "IQ", name: "Iraq", dialCode: "+964", tz: "Asia/Baghdad" },
  { code: "IE", name: "Ireland", dialCode: "+353", tz: "Europe/Dublin" },
  { code: "IM", name: "Isle of Man", dialCode: "+44", tz: "Europe/London" },
  { code: "IL", name: "Israel", dialCode: "+972", tz: "Asia/Jerusalem" },
  { code: "IT", name: "Italy", dialCode: "+39", tz: "Europe/Rome" },
  { code: "JM", name: "Jamaica", dialCode: "+1", tz: "America/Jamaica" },
  { code: "JP", name: "Japan", dialCode: "+81", tz: "Asia/Tokyo" },
  { code: "JE", name: "Jersey", dialCode: "+44", tz: "Europe/London" },
  { code: "JO", name: "Jordan", dialCode: "+962", tz: "Asia/Amman" },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7", tz: "Asia/Almaty" },
  { code: "KE", name: "Kenya", dialCode: "+254", tz: "Africa/Nairobi" },
  { code: "KI", name: "Kiribati", dialCode: "+686", tz: "Pacific/Tarawa" },
  { code: "KP", name: "Korea, Democratic People's Republic of", dialCode: "+850", tz: "Asia/Pyongyang" },
  { code: "KR", name: "Korea, Republic of", dialCode: "+82", tz: "Asia/Seoul" },
  { code: "KW", name: "Kuwait", dialCode: "+965", tz: "Asia/Kuwait" },
  { code: "KG", name: "Kyrgyzstan", dialCode: "+996", tz: "Asia/Bishkek" },
  { code: "LA", name: "Lao People's Democratic Republic", dialCode: "+856", tz: "Asia/Vientiane" },
  { code: "LV", name: "Latvia", dialCode: "+371", tz: "Europe/Riga" },
  { code: "LB", name: "Lebanon", dialCode: "+961", tz: "Asia/Beirut" },
  { code: "LS", name: "Lesotho", dialCode: "+266", tz: "Africa/Maseru" },
  { code: "LR", name: "Liberia", dialCode: "+231", tz: "Africa/Monrovia" },
  { code: "LY", name: "Libya", dialCode: "+218", tz: "Africa/Tripoli" },
  { code: "LI", name: "Liechtenstein", dialCode: "+423", tz: "Europe/Vaduz" },
  { code: "LT", name: "Lithuania", dialCode: "+370", tz: "Europe/Vilnius" },
  { code: "LU", name: "Luxembourg", dialCode: "+352", tz: "Europe/Luxembourg" },
  { code: "MO", name: "Macao", dialCode: "+853", tz: "Asia/Macau" },
  { code: "MG", name: "Madagascar", dialCode: "+261", tz: "Indian/Antananarivo" },
  { code: "MW", name: "Malawi", dialCode: "+265", tz: "Africa/Blantyre" },
  { code: "MY", name: "Malaysia", dialCode: "+60", tz: "Asia/Kuala_Lumpur" },
  { code: "MV", name: "Maldives", dialCode: "+960", tz: "Indian/Maldives" },
  { code: "ML", name: "Mali", dialCode: "+223", tz: "Africa/Bamako" },
  { code: "MT", name: "Malta", dialCode: "+356", tz: "Europe/Malta" },
  { code: "MH", name: "Marshall Islands", dialCode: "+692", tz: "Pacific/Majuro" },
  { code: "MQ", name: "Martinique", dialCode: "+596", tz: "America/Martinique" },
  { code: "MR", name: "Mauritania", dialCode: "+222", tz: "Africa/Nouakchott" },
  { code: "MU", name: "Mauritius", dialCode: "+230", tz: "Indian/Mauritius" },
  { code: "YT", name: "Mayotte", dialCode: "+262", tz: "Indian/Mayotte" },
  { code: "MX", name: "Mexico", dialCode: "+52", tz: "America/Mexico_City" },
  { code: "FM", name: "Micronesia", dialCode: "+691", tz: "Pacific/Pohnpei" },
  { code: "MD", name: "Moldova", dialCode: "+373", tz: "Europe/Chisinau" },
  { code: "MC", name: "Monaco", dialCode: "+377", tz: "Europe/Monaco" },
  { code: "MN", name: "Mongolia", dialCode: "+976", tz: "Asia/Ulaanbaatar" },
  { code: "ME", name: "Montenegro", dialCode: "+382", tz: "Europe/Podgorica" },
  { code: "MS", name: "Montserrat", dialCode: "+1", tz: "America/Montserrat" },
  { code: "MA", name: "Morocco", dialCode: "+212", tz: "Africa/Casablanca" },
  { code: "MZ", name: "Mozambique", dialCode: "+258", tz: "Africa/Maputo" },
  { code: "MM", name: "Myanmar", dialCode: "+95", tz: "Asia/Yangon" },
  { code: "NA", name: "Namibia", dialCode: "+264", tz: "Africa/Windhoek" },
  { code: "NR", name: "Nauru", dialCode: "+674", tz: "Pacific/Nauru" },
  { code: "NP", name: "Nepal", dialCode: "+977", tz: "Asia/Kathmandu" },
  { code: "NL", name: "Netherlands", dialCode: "+31", tz: "Europe/Amsterdam" },
  { code: "NC", name: "New Caledonia", dialCode: "+687", tz: "Pacific/Noumea" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", tz: "Pacific/Auckland" },
  { code: "NI", name: "Nicaragua", dialCode: "+505", tz: "America/Managua" },
  { code: "NE", name: "Niger", dialCode: "+227", tz: "Africa/Niamey" },
  { code: "NG", name: "Nigeria", dialCode: "+234", tz: "Africa/Lagos" },
  { code: "NU", name: "Niue", dialCode: "+683", tz: "Pacific/Niue" },
  { code: "NF", name: "Norfolk Island", dialCode: "+672", tz: "Pacific/Norfolk" },
  { code: "MK", name: "North Macedonia", dialCode: "+389", tz: "Europe/Skopje" },
  { code: "MP", name: "Northern Mariana Islands", dialCode: "+1", tz: "Pacific/Saipan" },
  { code: "NO", name: "Norway", dialCode: "+47", tz: "Europe/Oslo" },
  { code: "OM", name: "Oman", dialCode: "+968", tz: "Asia/Muscat" },
  { code: "PK", name: "Pakistan", dialCode: "+92", tz: "Asia/Karachi" },
  { code: "PW", name: "Palau", dialCode: "+680", tz: "Pacific/Palau" },
  { code: "PS", name: "Palestine, State of", dialCode: "+970", tz: "Asia/Gaza" },
  { code: "PA", name: "Panama", dialCode: "+507", tz: "America/Panama" },
  { code: "PG", name: "Papua New Guinea", dialCode: "+675", tz: "Pacific/Port_Moresby" },
  { code: "PY", name: "Paraguay", dialCode: "+595", tz: "America/Asuncion" },
  { code: "PE", name: "Peru", dialCode: "+51", tz: "America/Lima" },
  { code: "PH", name: "Philippines", dialCode: "+63", tz: "Asia/Manila" },
  { code: "PN", name: "Pitcairn", dialCode: "+64", tz: "Pacific/Pitcairn" },
  { code: "PL", name: "Poland", dialCode: "+48", tz: "Europe/Warsaw" },
  { code: "PT", name: "Portugal", dialCode: "+351", tz: "Europe/Lisbon" },
  { code: "PR", name: "Puerto Rico", dialCode: "+1", tz: "America/Puerto_Rico" },
  { code: "QA", name: "Qatar", dialCode: "+974", tz: "Asia/Qatar" },
  { code: "RE", name: "Réunion", dialCode: "+262", tz: "Indian/Reunion" },
  { code: "RO", name: "Romania", dialCode: "+40", tz: "Europe/Bucharest" },
  { code: "RU", name: "Russian Federation", dialCode: "+7", tz: "Europe/Moscow" },
  { code: "RW", name: "Rwanda", dialCode: "+250", tz: "Africa/Kigali" },
  { code: "BL", name: "Saint Barthélemy", dialCode: "+590", tz: "America/Guadeloupe" },
  { code: "SH", name: "Saint Helena, Ascension and Tristan da Cunha", dialCode: "+290", tz: "Atlantic/St_Helena" },
  { code: "KN", name: "Saint Kitts and Nevis", dialCode: "+1", tz: "America/St_Kitts" },
  { code: "LC", name: "Saint Lucia", dialCode: "+1", tz: "America/St_Lucia" },
  { code: "MF", name: "Saint Martin (French part)", dialCode: "+590", tz: "America/Guadeloupe" },
  { code: "PM", name: "Saint Pierre and Miquelon", dialCode: "+508", tz: "America/Miquelon" },
  { code: "VC", name: "Saint Vincent and the Grenadines", dialCode: "+1", tz: "America/St_Vincent" },
  { code: "WS", name: "Samoa", dialCode: "+685", tz: "Pacific/Apia" },
  { code: "SM", name: "San Marino", dialCode: "+378", tz: "Europe/Rome" },
  { code: "ST", name: "Sao Tome and Principe", dialCode: "+239", tz: "Africa/Sao_Tome" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", tz: "Asia/Riyadh" },
  { code: "SN", name: "Senegal", dialCode: "+221", tz: "Africa/Dakar" },
  { code: "RS", name: "Serbia", dialCode: "+381", tz: "Europe/Belgrade" },
  { code: "SC", name: "Seychelles", dialCode: "+248", tz: "Indian/Mahe" },
  { code: "SL", name: "Sierra Leone", dialCode: "+232", tz: "Africa/Freetown" },
  { code: "SG", name: "Singapore", dialCode: "+65", tz: "Asia/Singapore" },
  { code: "SX", name: "Sint Maarten (Dutch part)", dialCode: "+1", tz: "America/Curacao" },
  { code: "SK", name: "Slovakia", dialCode: "+421", tz: "Europe/Bratislava" },
  { code: "SI", name: "Slovenia", dialCode: "+386", tz: "Europe/Ljubljana" },
  { code: "SB", name: "Solomon Islands", dialCode: "+677", tz: "Pacific/Guadalcanal" },
  { code: "SO", name: "Somalia", dialCode: "+252", tz: "Africa/Mogadishu" },
  { code: "ZA", name: "South Africa", dialCode: "+27", tz: "Africa/Johannesburg" },
  { code: "GS", name: "South Georgia and the South Sandwich Islands", dialCode: "+500", tz: "Atlantic/South_Georgia" },
  { code: "SS", name: "South Sudan", dialCode: "+211", tz: "Africa/Juba" },
  { code: "ES", name: "Spain", dialCode: "+34", tz: "Europe/Madrid" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", tz: "Asia/Colombo" },
  { code: "SD", name: "Sudan", dialCode: "+249", tz: "Africa/Khartoum" },
  { code: "SR", name: "Suriname", dialCode: "+597", tz: "America/Paramaribo" },
  { code: "SJ", name: "Svalbard and Jan Mayen", dialCode: "+47", tz: "Europe/Oslo" },
  { code: "SE", name: "Sweden", dialCode: "+46", tz: "Europe/Stockholm" },
  { code: "CH", name: "Switzerland", dialCode: "+41", tz: "Europe/Zurich" },
  { code: "SY", name: "Syrian Arab Republic", dialCode: "+963", tz: "Asia/Damascus" },
  { code: "TW", name: "Taiwan", dialCode: "+886", tz: "Asia/Taipei" },
  { code: "TJ", name: "Tajikistan", dialCode: "+992", tz: "Asia/Dushanbe" },
  { code: "TZ", name: "Tanzania", dialCode: "+255", tz: "Africa/Dar_es_Salaam" },
  { code: "TH", name: "Thailand", dialCode: "+66", tz: "Asia/Bangkok" },
  { code: "TL", name: "Timor-Leste", dialCode: "+670", tz: "Asia/Dili" },
  { code: "TG", name: "Togo", dialCode: "+228", tz: "Africa/Lome" },
  { code: "TK", name: "Tokelau", dialCode: "+690", tz: "Pacific/Fakaofo" },
  { code: "TO", name: "Tonga", dialCode: "+676", tz: "Pacific/Tongatapu" },
  { code: "TT", name: "Trinidad and Tobago", dialCode: "+1", tz: "America/Port_of_Spain" },
  { code: "TN", name: "Tunisia", dialCode: "+216", tz: "Africa/Tunis" },
  { code: "TR", name: "Türkiye", dialCode: "+90", tz: "Europe/Istanbul" },
  { code: "TM", name: "Turkmenistan", dialCode: "+993", tz: "Asia/Ashgabat" },
  { code: "TC", name: "Turks and Caicos Islands", dialCode: "+1", tz: "America/Grand_Turk" },
  { code: "TV", name: "Tuvalu", dialCode: "+688", tz: "Pacific/Funafuti" },
  { code: "UG", name: "Uganda", dialCode: "+256", tz: "Africa/Kampala" },
  { code: "UA", name: "Ukraine", dialCode: "+380", tz: "Europe/Kyiv" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", tz: "Asia/Dubai" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", tz: "Europe/London" },
  { code: "US", name: "United States", dialCode: "+1", tz: "America/New_York" },
  { code: "UM", name: "United States Minor Outlying Islands", dialCode: "+1", tz: "Pacific/Wake" },
  { code: "UY", name: "Uruguay", dialCode: "+598", tz: "America/Montevideo" },
  { code: "UZ", name: "Uzbekistan", dialCode: "+998", tz: "Asia/Tashkent" },
  { code: "VU", name: "Vanuatu", dialCode: "+678", tz: "Pacific/Efate" },
  { code: "VE", name: "Venezuela", dialCode: "+58", tz: "America/Caracas" },
  { code: "VN", name: "Viet Nam", dialCode: "+84", tz: "Asia/Ho_Chi_Minh" },
  { code: "VG", name: "Virgin Islands (British)", dialCode: "+1", tz: "America/Tortola" },
  { code: "VI", name: "Virgin Islands (U.S.)", dialCode: "+1", tz: "America/St_Thomas" },
  { code: "WF", name: "Wallis and Futuna", dialCode: "+681", tz: "Pacific/Wallis" },
  { code: "EH", name: "Western Sahara", dialCode: "+212", tz: "Africa/El_Aaiun" },
  { code: "YE", name: "Yemen", dialCode: "+967", tz: "Asia/Aden" },
  { code: "ZM", name: "Zambia", dialCode: "+260", tz: "Africa/Lusaka" },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", tz: "Africa/Harare" },
];

/** Regional-indicator flag emoji for an ISO 3166-1 alpha-2 code, e.g. "IN" → 🇮🇳. */
export function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/[A-Z]/g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

/**
 * Expected NATIONAL number length(s) in digits — excluding the dial code — per
 * ISO 3166-1 alpha-2 code. A single value is an exact length; an array lists
 * every accepted length (countries whose mobile/landline formats differ). Codes
 * not listed fall back to the generic 4–15 digit range below, so add an exact
 * entry here to tighten validation for a specific country.
 *
 * Curated conservatively: where a country's lengths vary widely we prefer a
 * range (or omit it) rather than risk rejecting a valid number.
 */
export const PHONE_LENGTHS: Record<string, number | number[]> = {
  IN: 10, US: 10, CA: 10, GB: [9, 10], AU: 9, AE: 9, SG: 8, PK: 10, BD: 10,
  NP: 10, LK: 9, SA: 9, QA: 8, KW: 8, FR: 9, ES: 9, NL: 9, IT: [9, 10],
  ZA: 9, KE: 9, PH: 10, MY: [9, 10], ID: [9, 10, 11, 12], TH: 9, VN: 9,
  CN: 11, JP: [9, 10], KR: [9, 10], BR: [10, 11], MX: 10, AR: 10, RU: 10,
  TR: 10, PL: 9, CH: 9, NZ: [8, 9, 10], IL: 9, BE: [8, 9], PT: 9, NG: [8, 10],
};

/** Loosest accepted digit count for a country without an exact spec above. */
export const GENERIC_PHONE_MIN = 4;
export const GENERIC_PHONE_MAX = 15;

/** Count numeric digits in a string, ignoring +, spaces, dashes, parentheses. */
export function countPhoneDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

/** Accepted national-number lengths for a country code, or null when generic. */
function allowedPhoneLengths(code: string): number[] | null {
  const spec = PHONE_LENGTHS[code.toUpperCase()];
  if (spec == null) return null;
  return Array.isArray(spec) ? spec : [spec];
}

/** Human label for a set of lengths, e.g. "10-digit" or "9 or 10-digit". */
function phoneLengthsLabel(lengths: number[]): string {
  const sorted = [...lengths].sort((a, b) => a - b);
  if (sorted.length === 1) return `${sorted[0]}-digit`;
  return `${sorted.slice(0, -1).join(", ")} or ${sorted[sorted.length - 1]}-digit`;
}

/**
 * Validate a national number's digit count for a country. Returns a
 * human-readable error message when the length is wrong, or null when it
 * passes. Shared by the checkout modal (client-side UX) and the register route
 * (authoritative), so both enforce exactly the same rule.
 */
export function phoneLengthError(
  nationalDigits: number,
  country: { code: string; name: string }
): string | null {
  const allowed = allowedPhoneLengths(country.code);
  if (allowed) {
    if (!allowed.includes(nationalDigits)) {
      return `Enter a valid ${phoneLengthsLabel(allowed)} phone number for ${country.name}.`;
    }
    return null;
  }
  if (nationalDigits < GENERIC_PHONE_MIN || nationalDigits > GENERIC_PHONE_MAX) {
    return `Enter a valid phone number (${GENERIC_PHONE_MIN}–${GENERIC_PHONE_MAX} digits).`;
  }
  return null;
}
