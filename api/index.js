const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { parsePhoneNumberWithError } = require('libphonenumber-js');


dotenv.config();

const app = express();

const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

async function connectDB() {
    try {
      await mongoose.connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ MongoDB Connected');
    } catch (err) {
      console.error('❌ DB Connection Error:', err.message);
      process.exit(1); // Stop the app if DB fails to connect
    }
  }
  
  connectDB();

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

//Routes
app.use('/admin', require('./routes/admin'));
app.use('/leads', require('./routes/leads'));
app.use('/deals', require('./routes/deals'));
app.use('/engagements', require('./routes/engagement'));

app.get('/', (req, res) => {
    res.render('admin/index', { title: 'Sales Lite Admin', message: 'Welcome to the admin panel' });
  });
  function isClearlyIndian(number) {
    const cleaned = number.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleaned); // 10-digit Indian mobile format
  }
  
  function normalizePhoneForParsing(phone) {
    let cleaned = phone.replace(/\D/g, '');
  
    if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
    if (cleaned.startsWith('91')) return '+' + cleaned;
    if (/^[1-9]\d{9,13}$/.test(cleaned)) return '+' + cleaned;
  
    return phone;
  }

  const countryNames = {
    AF: 'Afghanistan',
    AL: 'Albania',
    DZ: 'Algeria',
    AS: 'American Samoa',
    AD: 'Andorra',
    AO: 'Angola',
    AI: 'Anguilla',
    AQ: 'Antarctica',
    AG: 'Antigua and Barbuda',
    AR: 'Argentina',
    AM: 'Armenia',
    AW: 'Aruba',
    AU: 'Australia',
    AT: 'Austria',
    AZ: 'Azerbaijan',
    BS: 'Bahamas',
    BH: 'Bahrain',
    BD: 'Bangladesh',
    BB: 'Barbados',
    BY: 'Belarus',
    BE: 'Belgium',
    BZ: 'Belize',
    BJ: 'Benin',
    BM: 'Bermuda',
    BT: 'Bhutan',
    BO: 'Bolivia',
    BA: 'Bosnia and Herzegovina',
    BW: 'Botswana',
    BR: 'Brazil',
    BN: 'Brunei',
    BG: 'Bulgaria',
    BF: 'Burkina Faso',
    BI: 'Burundi',
    KH: 'Cambodia',
    CM: 'Cameroon',
    CA: 'Canada',
    CV: 'Cape Verde',
    KY: 'Cayman Islands',
    CF: 'Central African Republic',
    TD: 'Chad',
    CL: 'Chile',
    CN: 'China',
    CO: 'Colombia',
    KM: 'Comoros',
    CG: 'Congo (Brazzaville)',
    CD: 'Congo (Kinshasa)',
    CR: 'Costa Rica',
    HR: 'Croatia',
    CU: 'Cuba',
    CY: 'Cyprus',
    CZ: 'Czech Republic',
    DK: 'Denmark',
    DJ: 'Djibouti',
    DM: 'Dominica',
    DO: 'Dominican Republic',
    EC: 'Ecuador',
    EG: 'Egypt',
    SV: 'El Salvador',
    GQ: 'Equatorial Guinea',
    ER: 'Eritrea',
    EE: 'Estonia',
    ET: 'Ethiopia',
    FJ: 'Fiji',
    FI: 'Finland',
    FR: 'France',
    GA: 'Gabon',
    GM: 'Gambia',
    GE: 'Georgia',
    DE: 'Germany',
    GH: 'Ghana',
    GR: 'Greece',
    GD: 'Grenada',
    GT: 'Guatemala',
    GN: 'Guinea',
    GW: 'Guinea-Bissau',
    GY: 'Guyana',
    HT: 'Haiti',
    HN: 'Honduras',
    HK: 'Hong Kong',
    HU: 'Hungary',
    IS: 'Iceland',
    IN: 'India',
    ID: 'Indonesia',
    IR: 'Iran',
    IQ: 'Iraq',
    IE: 'Ireland',
    IL: 'Israel',
    IT: 'Italy',
    JM: 'Jamaica',
    JP: 'Japan',
    JO: 'Jordan',
    KZ: 'Kazakhstan',
    KE: 'Kenya',
    KI: 'Kiribati',
    KP: 'North Korea',
    KR: 'South Korea',
    KW: 'Kuwait',
    KG: 'Kyrgyzstan',
    LA: 'Laos',
    LV: 'Latvia',
    LB: 'Lebanon',
    LS: 'Lesotho',
    LR: 'Liberia',
    LY: 'Libya',
    LI: 'Liechtenstein',
    LT: 'Lithuania',
    LU: 'Luxembourg',
    MO: 'Macao',
    MK: 'North Macedonia',
    MG: 'Madagascar',
    MW: 'Malawi',
    MY: 'Malaysia',
    MV: 'Maldives',
    ML: 'Mali',
    MT: 'Malta',
    MH: 'Marshall Islands',
    MR: 'Mauritania',
    MU: 'Mauritius',
    MX: 'Mexico',
    FM: 'Micronesia',
    MD: 'Moldova',
    MC: 'Monaco',
    MN: 'Mongolia',
    ME: 'Montenegro',
    MA: 'Morocco',
    MZ: 'Mozambique',
    MM: 'Myanmar',
    NA: 'Namibia',
    NR: 'Nauru',
    NP: 'Nepal',
    NL: 'Netherlands',
    NZ: 'New Zealand',
    NI: 'Nicaragua',
    NE: 'Niger',
    NG: 'Nigeria',
    NO: 'Norway',
    OM: 'Oman',
    PK: 'Pakistan',
    PW: 'Palau',
    PS: 'Palestinian Territories',
    PA: 'Panama',
    PG: 'Papua New Guinea',
    PY: 'Paraguay',
    PE: 'Peru',
    PH: 'Philippines',
    PL: 'Poland',
    PT: 'Portugal',
    QA: 'Qatar',
    RO: 'Romania',
    RU: 'Russia',
    RW: 'Rwanda',
    KN: 'Saint Kitts and Nevis',
    LC: 'Saint Lucia',
    VC: 'Saint Vincent and the Grenadines',
    WS: 'Samoa',
    SM: 'San Marino',
    ST: 'Sao Tome and Principe',
    SA: 'Saudi Arabia',
    SN: 'Senegal',
    RS: 'Serbia',
    SC: 'Seychelles',
    SL: 'Sierra Leone',
    SG: 'Singapore',
    SK: 'Slovakia',
    SI: 'Slovenia',
    SB: 'Solomon Islands',
    SO: 'Somalia',
    ZA: 'South Africa',
    SS: 'South Sudan',
    ES: 'Spain',
    LK: 'Sri Lanka',
    SD: 'Sudan',
    SR: 'Suriname',
    SE: 'Sweden',
    CH: 'Switzerland',
    SY: 'Syria',
    TW: 'Taiwan',
    TJ: 'Tajikistan',
    TZ: 'Tanzania',
    TH: 'Thailand',
    TL: 'Timor-Leste',
    TG: 'Togo',
    TO: 'Tonga',
    TT: 'Trinidad and Tobago',
    TN: 'Tunisia',
    TR: 'Turkey',
    TM: 'Turkmenistan',
    TV: 'Tuvalu',
    UG: 'Uganda',
    UA: 'Ukraine',
    AE: 'United Arab Emirates',
    GB: 'United Kingdom',
    US: 'United States',
    UY: 'Uruguay',
    UZ: 'Uzbekistan',
    VU: 'Vanuatu',
    VA: 'Vatican City',
    VE: 'Venezuela',
    VN: 'Vietnam',
    YE: 'Yemen',
    ZM: 'Zambia',
    ZW: 'Zimbabwe'
  };
  
  
  app.post('/detect-country', (req, res) => {
    const { phone } = req.body;
  
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
  
    try {
      const cleaned = phone.replace(/\D/g, '');
  
      if (isClearlyIndian(phone)) {
        return res.json({
          input: phone,
          normalized: '+91' + cleaned,
          countryCode: 'IN',
          countryName: 'India',
          source: 'Local pattern',
        });
      }
  
      const normalized = normalizePhoneForParsing(phone);
      const parsed = parsePhoneNumberWithError(normalized);
      console.log(parsed)
      const fullCountryName = countryNames[parsed.country] || parsed.country;
  
      return res.json({
        input: phone,
        normalized,
        formatted: parsed.formatInternational(),
        countryCode: parsed.country,
        countryName: fullCountryName,
        source: 'Parsed via libphonenumber-js',
      });
    } catch (err) {
      return res.status(400).json({
        error: 'Invalid phone number',
        detail: err.message,
      });
    }
  });

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`)); 