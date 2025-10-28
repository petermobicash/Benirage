// Location data for cascading dropdowns in forms
export interface LocationOption {
  value: string;
  label: string;
}

export interface LocationData {
  [country: string]: {
    districts: LocationOption[];
    sectors?: { [district: string]: LocationOption[] };
    cells?: { [sector: string]: LocationOption[] };
    villages?: { [cell: string]: LocationOption[] };
  };
}

// Comprehensive location data for Rwanda and other countries
export const LOCATION_DATA: LocationData = {
  // Rwanda
  'Rwanda': {
    districts: [
      { value: 'kigali-city', label: 'Kigali City' },
      { value: 'southern-province', label: 'Southern Province' },
      { value: 'western-province', label: 'Western Province' },
      { value: 'northern-province', label: 'Northern Province' },
      { value: 'eastern-province', label: 'Eastern Province' }
    ],
    sectors: {
      'kigali-city': [
        { value: 'gasabo', label: 'Gasabo' },
        { value: 'kicukiro', label: 'Kicukiro' },
        { value: 'nyarugenge', label: 'Nyarugenge' }
      ],
      'southern-province': [
        { value: 'huye', label: 'Huye' },
        { value: 'nyanza', label: 'Nyanza' },
        { value: 'gisagara', label: 'Gisagara' },
        { value: 'nyamagabe', label: 'Nyamagabe' },
        { value: 'ruhango', label: 'Ruhango' },
        { value: 'muhanga', label: 'Muhanga' },
        { value: 'kamonyi', label: 'Kamonyi' }
      ],
      'western-province': [
        { value: 'karongi', label: 'Karongi' },
        { value: 'rutsiro', label: 'Rutsiro' },
        { value: 'rubavu', label: 'Rubavu' },
        { value: 'nyabihu', label: 'Nyabihu' },
        { value: 'ngororero', label: 'Ngororero' },
        { value: 'rusizi', label: 'Rusizi' },
        { value: 'nyamasheke', label: 'Nyamasheke' }
      ],
      'northern-province': [
        { value: 'rumgando', label: 'Rulindo' },
        { value: 'gakenke', label: 'Gakenke' },
        { value: 'musanze', label: 'Musanze' },
        { value: 'burera', label: 'Burera' },
        { value: 'gicumbi', label: 'Gicumbi' }
      ],
      'eastern-province': [
        { value: 'rwamagana', label: 'Rwamagana' },
        { value: 'nyagatare', label: 'Nyagatare' },
        { value: 'gatsibo', label: 'Gatsibo' },
        { value: 'kayonza', label: 'Kayonza' },
        { value: 'kirehe', label: 'Kirehe' },
        { value: 'ngoma', label: 'Ngoma' },
        { value: 'bugesera', label: 'Bugesera' }
      ]
    },
    cells: {
      'gasabo': [
        { value: 'bumbogo', label: 'Bumbogo' },
        { value: 'gatsata', label: 'Gatsata' },
        { value: 'gisozi', label: 'Gisozi' },
        { value: 'jabana', label: 'Jabana' },
        { value: 'jyinya', label: 'Jyinya' },
        { value: 'kacyiru', label: 'Kacyiru' },
        { value: 'kimisagara', label: 'Kimisagara' },
        { value: 'kimironko', label: 'Kimironko' },
        { value: 'kisimenti', label: 'Kisimenti' },
        { value: 'ndera', label: 'Ndera' },
        { value: 'remara', label: 'Remera' },
        { value: 'rutunga', label: 'Rutunga' }
      ],
      'kicukiro': [
        { value: 'gahanga', label: 'Gahanga' },
        { value: 'gatenga', label: 'Gatenga' },
        { value: 'gikondo', label: 'Gikondo' },
        { value: 'kagarama', label: 'Kagarama' },
        { value: 'kanombe', label: 'Kanombe' },
        { value: 'kicukiro', label: 'Kicukiro' },
        { value: 'masaka', label: 'Masaka' },
        { value: 'Niboye', label: 'Niboye' }
      ],
      'nyarugenge': [
        { value: 'gitega', label: 'Gitega' },
        { value: 'kanyinya', label: 'Kanyinya' },
        { value: 'kigali', label: 'Kigali' },
        { value: 'kimisagara', label: 'Kimisagara' },
        { value: 'mageregere', label: 'Mageregere' },
        { value: 'muhima', label: 'Muhima' },
        { value: 'nyakabanda', label: 'Nyakabanda' },
        { value: 'nyamirambo', label: 'Nyamirambo' },
        { value: 'nyarugenge', label: 'Nyarugenge' }
      ]
    }
  },

  // Burundi
  'Burundi': {
    districts: [
      { value: 'bujumbura-mairie', label: 'Bujumbura Mairie' },
      { value: 'bujumbura-rural', label: 'Bujumbura Rural' },
      { value: 'bururi', label: 'Bururi' },
      { value: 'cankuzo', label: 'Cankuzo' },
      { value: 'gitega', label: 'Gitega' },
      { value: 'karuzi', label: 'Karuzi' },
      { value: 'kayanza', label: 'Kayanza' },
      { value: 'kirundo', label: 'Kirundo' },
      { value: 'makamba', label: 'Makamba' },
      { value: 'muramvya', label: 'Muramvya' },
      { value: 'muyinga', label: 'Muyinga' },
      { value: 'mwaro', label: 'Mwaro' },
      { value: 'ngozi', label: 'Ngozi' },
      { value: 'rutana', label: 'Rutana' },
      { value: 'ruyigi', label: 'Ruyigi' }
    ],
    sectors: {
      'bujumbura-mairie': [
        { value: 'buyenzi', label: 'Buyenzi' },
        { value: 'bwiza', label: 'Bwiza' },
        { value: 'cibitoke', label: 'Cibitoke' },
        { value: 'gihosha', label: 'Gihosha' },
        { value: 'kamenge', label: 'Kamenge' },
        { value: 'kinama', label: 'Kinama' },
        { value: 'kinindo', label: 'Kinindo' },
        { value: 'musaga', label: 'Musaga' },
        { value: 'ngagara', label: 'Ngagara' },
        { value: 'nyakabiga', label: 'Nyakabiga' },
        { value: 'rohero', label: 'Rohero' }
      ],
      'bujumbura-rural': [
        { value: 'isale', label: 'Isale' },
        { value: 'kabezi', label: 'Kabezi' },
        { value: 'kanyosha', label: 'Kanyosha' },
        { value: 'mukaza', label: 'Mukaza' },
        { value: 'muyenzi', label: 'Muyenzi' },
        { value: 'mutambu', label: 'Mutambu' },
        { value: 'nyabiraba', label: 'Nyabiraba' }
      ],
      'bururi': [
        { value: 'bururi', label: 'Bururi' },
        { value: 'matana', label: 'Matana' },
        { value: 'mugamba', label: 'Mugamba' },
        { value: 'rutovu', label: 'Rutovu' },
        { value: 'songa', label: 'Songa' },
        { value: 'vyanda', label: 'Vyanda' }
      ],
      'cankuzo': [
        { value: 'cankuzo', label: 'Cankuzo' },
        { value: 'cenda', label: 'Cendajuru' },
        { value: 'gisagara', label: 'Gisagara' },
        { value: 'kigamba', label: 'Kigamba' },
        { value: 'mishiha', label: 'Mishiha' }
      ],
      'gitega': [
        { value: 'bugendana', label: 'Bugendana' },
        { value: 'bukirasazi', label: 'Bukirasazi' },
        { value: 'buraza', label: 'Buraza' },
        { value: 'gitega', label: 'Gitega' },
        { value: 'itaba', label: 'Itaba' },
        { value: 'makebuko', label: 'Makebuko' },
        { value: 'mutaho', label: 'Mutaho' },
        { value: 'nyabutare', label: 'Nyabutare' },
        { value: 'ryansoro', label: 'Ryansoro' }
      ],
      'karuzi': [
        { value: 'bugenyuzi', label: 'Bugenyuzi' },
        { value: 'gihogazi', label: 'Gihogazi' },
        { value: 'karuzi', label: 'Karuzi' },
        { value: 'mutumba', label: 'Mutumba' },
        { value: 'nyabikere', label: 'Nyabikere' },
        { value: 'shombo', label: 'Shombo' }
      ],
      'kayanza': [
        { value: 'butaganzwa', label: 'Butaganzwa' },
        { value: 'gahombo', label: 'Gahombo' },
        { value: 'gatara', label: 'Gatara' },
        { value: 'kabuye', label: 'Kabuye' },
        { value: 'kayanza', label: 'Kayanza' },
        { value: 'matongo', label: 'Matongo' },
        { value: 'muha', label: 'Muha' },
        { value: 'muruta', label: 'Muruta' },
        { value: 'rango', label: 'Rango' }
      ],
      'kirundo': [
        { value: 'bugabira', label: 'Bugabira' },
        { value: 'busoni', label: 'Busoni' },
        { value: 'bwambarangwe', label: 'Bwambarangwe' },
        { value: 'gitobe', label: 'Gitobe' },
        { value: 'kirundo', label: 'Kirundo' },
        { value: 'nyanrusange', label: 'Nyanrusange' },
        { value: 'vumbi', label: 'Vumbi' }
      ],
      'makamba': [
        { value: 'kayogoro', label: 'Kayogoro' },
        { value: 'kinyinya', label: 'Kinyinya' },
        { value: 'makamba', label: 'Makamba' },
        { value: 'nabiromvu', label: 'Nabiromvu' },
        { value: 'vugizo', label: 'Vugizo' }
      ],
      'muramvya': [
        { value: 'bukeye', label: 'Bukeye' },
        { value: 'kiganda', label: 'Kiganda' },
        { value: 'muramvya', label: 'Muramvya' },
        { value: 'rutegama', label: 'Rutegama' }
      ],
      'muyinga': [
        { value: 'buhinyuza', label: 'Buhinyuza' },
        { value: 'gashoho', label: 'Gashoho' },
        { value: 'gasorwe', label: 'Gasorwe' },
        { value: 'muyinga', label: 'Muyinga' },
        { value: 'ngozi', label: 'Ngozi' }
      ],
      'mwaro': [
        { value: 'bisoro', label: 'Bisoro' },
        { value: 'gisozi', label: 'Gisozi' },
        { value: 'kayokwe', label: 'Kayokwe' },
        { value: 'mwaro', label: 'Mwaro' },
        { value: 'nyabihanga', label: 'Nyabihanga' }
      ],
      'ngozi': [
        { value: 'buye', label: 'Buye' },
        { value: 'gashikanwa', label: 'Gashikanwa' },
        { value: 'kiremba', label: 'Kiremba' },
        { value: 'marangara', label: 'Marangara' },
        { value: 'mwumba', label: 'Mwumba' },
        { value: 'ngozi', label: 'Ngozi' },
        { value: 'nyamurenza', label: 'Nyamurenza' },
        { value: 'ruhoro', label: 'Ruhoro' },
        { value: 'tangara', label: 'Tangara' }
      ],
      'rutana': [
        { value: 'bukemba', label: 'Bukemba' },
        { value: 'gitanga', label: 'Gitanga' },
        { value: 'mpinga-kayove', label: 'Mpinga-Kayove' },
        { value: 'musongati', label: 'Musongati' },
        { value: 'rutana', label: 'Rutana' }
      ],
      'ruyigi': [
        { value: 'butaganzwa', label: 'Butaganzwa' },
        { value: 'bweru', label: 'Bweru' },
        { value: 'gisuru', label: 'Gisuru' },
        { value: 'kinyinya', label: 'Kinyinya' },
        { value: 'nyabitsinda', label: 'Nyabitsinda' },
        { value: 'ruyigi', label: 'Ruyigi' }
      ]
    }
  },

  // Uganda
  'Uganda': {
    districts: [
      // Central Region
      { value: 'kampala', label: 'Kampala' },
      { value: 'wakiso', label: 'Wakiso' },
      { value: 'mukono', label: 'Mukono' },
      { value: 'buikwe', label: 'Buikwe' },
      { value: 'bukomansimbi', label: 'Bukomansimbi' },
      { value: 'butambala', label: 'Butambala' },
      { value: 'gomba', label: 'Gomba' },
      { value: 'kalangala', label: 'Kalangala' },
      { value: 'kalungu', label: 'Kalungu' },
      { value: 'kayunga', label: 'Kayunga' },
      { value: 'kyankwanzi', label: 'Kyankwanzi' },
      { value: 'luwero', label: 'Luwero' },
      { value: 'lwengo', label: 'Lwengo' },
      { value: 'lyantonde', label: 'Lyantonde' },
      { value: 'masaka', label: 'Masaka' },
      { value: 'mpigi', label: 'Mpigi' },
      { value: 'nakaseke', label: 'Nakaseke' },
      { value: 'nakasongola', label: 'Nakasongola' },
      { value: 'rakai', label: 'Rakai' },
      { value: 'sembabule', label: 'Sembabule' },
      { value: 'kiboga', label: 'Kiboga' },

      // Eastern Region
      { value: 'jinja', label: 'Jinja' },
      { value: 'iganga', label: 'Iganga' },
      { value: 'kamuli', label: 'Kamuli' },
      { value: 'kapchorwa', label: 'Kapchorwa' },
      { value: 'katakwi', label: 'Katakwi' },
      { value: 'kumi', label: 'Kumi' },
      { value: 'mbale', label: 'Mbale' },
      { value: 'pallisa', label: 'Pallisa' },
      { value: 'soroti', label: 'Soroti' },
      { value: 'tororo', label: 'Tororo' },
      { value: 'kaberamaido', label: 'Kaberamaido' },
      { value: 'mayuge', label: 'Mayuge' },
      { value: 'sironko', label: 'Sironko' },
      { value: 'budaka', label: 'Budaka' },
      { value: 'bududa', label: 'Bududa' },
      { value: 'bugiri', label: 'Bugiri' },
      { value: 'busia', label: 'Busia' },
      { value: 'butaleja', label: 'Butaleja' },
      { value: 'kaliro', label: 'Kaliro' },
      { value: 'manafwa', label: 'Manafwa' },
      { value: 'namutumba', label: 'Namutumba' },

      // Northern Region
      { value: 'gulu', label: 'Gulu' },
      { value: 'kitgum', label: 'Kitgum' },
      { value: 'kotido', label: 'Kotido' },
      { value: 'lira', label: 'Lira' },
      { value: 'pader', label: 'Pader' },
      { value: 'arua', label: 'Arua' },
      { value: 'nebbi', label: 'Nebbi' },
      { value: 'yumbe', label: 'Yumbe' },
      { value: 'moyo', label: 'Moyo' },
      { value: 'adjumani', label: 'Adjumani' },
      { value: 'apach', label: 'Apac' },
      { value: 'dokolo', label: 'Dokolo' },
      { value: 'amuru', label: 'Amuru' },
      { value: 'abim', label: 'Abim' },
      { value: 'kaabong', label: 'Kaabong' },
      { value: 'koboko', label: 'Koboko' },
      { value: 'maracha', label: 'Maracha' },
      { value: 'oyam', label: 'Oyam' },
      { value: 'agago', label: 'Agago' },
      { value: 'alebtong', label: 'Alebtong' },
      { value: 'amuria', label: 'Amuria' },
      { value: 'otuke', label: 'Otuke' },
      { value: 'lamwo', label: 'Lamwo' },
      { value: 'nwoya', label: 'Nwoya' },
      { value: 'zombo', label: 'Zombo' },

      // Western Region
      { value: 'mbarara', label: 'Mbarara' },
      { value: 'bushenyi', label: 'Bushenyi' },
      { value: 'hoima', label: 'Hoima' },
      { value: 'kabale', label: 'Kabale' },
      { value: 'kabarole', label: 'Kabarole' },
      { value: 'kasese', label: 'Kasese' },
      { value: 'kibaale', label: 'Kibaale' },
      { value: 'kisoro', label: 'Kisoro' },
      { value: 'masindi', label: 'Masindi' },
      { value: 'rukungiri', label: 'Rukungiri' },
      { value: 'kamwenge', label: 'Kamwenge' },
      { value: 'kanungu', label: 'Kanungu' },
      { value: 'kyenjojo', label: 'Kyenjojo' },
      { value: 'buliisa', label: 'Buliisa' },
      { value: 'bundibugyo', label: 'Bundibugyo' },
      { value: 'busia-western', label: 'Busia (Western)' },
      { value: 'fort-portal', label: 'Fort Portal' },
      { value: 'isingiro', label: 'Isingiro' },
      { value: 'kiruhura', label: 'Kiruhura' },
      { value: 'kiryandongo', label: 'Kiryandongo' },
      { value: 'kyegegwa', label: 'Kyegegwa' },
      { value: 'mitooma', label: 'Mitooma' },
      { value: 'ntoroko', label: 'Ntoroko' },
      { value: 'rubirizi', label: 'Rubirizi' },
      { value: 'sheema', label: 'Sheema' }
    ],
    sectors: {
      'kampala': [
        { value: 'central', label: 'Central Division' },
        { value: 'kawempe', label: 'Kawempe Division' },
        { value: 'makindye', label: 'Makindye Division' },
        { value: 'nakawa', label: 'Nakawa Division' },
        { value: 'rubaga', label: 'Rubaga Division' }
      ],
      'wakiso': [
        { value: 'busukuma', label: 'Busukuma' },
        { value: 'gombe', label: 'Gombe' },
        { value: 'kyadondo', label: 'Kyadondo' },
        { value: 'makindye-sabagabo', label: 'Makindye Sabagabo' },
        { value: 'nsangi', label: 'Nsangi' }
      ],
      'mukono': [
        { value: 'goma', label: 'Goma' },
        { value: 'kyampisi', label: 'Kyampisi' },
        { value: 'mukono', label: 'Mukono' },
        { value: 'nakisunga', label: 'Nakisunga' }
      ],
      'jinja': [
        { value: 'jinja-central', label: 'Jinja Central' },
        { value: 'jinja-east', label: 'Jinja East' },
        { value: 'jinja-west', label: 'Jinja West' },
        { value: 'kakira', label: 'Kakira' }
      ],
      'mbale': [
        { value: 'mbale-central', label: 'Mbale Central' },
        { value: 'mbale-east', label: 'Mbale East' },
        { value: 'mbale-west', label: 'Mbale West' },
        { value: 'bungokho', label: 'Bungokho' }
      ],
      'mbarara': [
        { value: 'kachwekano', label: 'Kachwekano' },
        { value: 'kakoba', label: 'Kakoba' },
        { value: 'kamukuzi', label: 'Kamukuzi' },
        { value: 'nyamitanga', label: 'Nyamitanga' }
      ],
      'gulu': [
        { value: 'gulu-municipal', label: 'Gulu Municipal' },
        { value: 'omoro', label: 'Omoro' },
        { value: 'nungamo', label: 'Nungamo' }
      ],
      'lira': [
        { value: 'lira-central', label: 'Lira Central' },
        { value: 'lira-east', label: 'Lira East' },
        { value: 'lira-west', label: 'Lira West' }
      ],
      'arua': [
        { value: 'arua-central', label: 'Arua Central' },
        { value: 'arua-east', label: 'Arua East' },
        { value: 'arua-west', label: 'Arua West' }
      ]
    }
  },

  // Kenya
  'Kenya': {
    districts: [
      // Nairobi Region
      { value: 'nairobi', label: 'Nairobi' },

      // Coast Region
      { value: 'mombasa', label: 'Mombasa' },
      { value: 'kwale', label: 'Kwale' },
      { value: 'kilifi', label: 'Kilifi' },
      { value: 'tana-river', label: 'Tana River' },
      { value: 'lamu', label: 'Lamu' },
      { value: 'taita-taveta', label: 'Taita-Taveta' },

      // North Eastern Region
      { value: 'garissa', label: 'Garissa' },
      { value: 'wajir', label: 'Wajir' },
      { value: 'mandera', label: 'Mandera' },

      // Eastern Region
      { value: 'marsabit', label: 'Marsabit' },
      { value: 'isiolo', label: 'Isiolo' },
      { value: 'meru', label: 'Meru' },
      { value: 'tharaka-nithi', label: 'Tharaka-Nithi' },
      { value: 'embu', label: 'Embu' },
      { value: 'kitui', label: 'Kitui' },
      { value: 'machakos', label: 'Machakos' },
      { value: 'makueni', label: 'Makueni' },

      // Central Region
      { value: 'nyandarua', label: 'Nyandarua' },
      { value: 'nyeri', label: 'Nyeri' },
      { value: 'kirinyaga', label: 'Kirinyaga' },
      { value: 'muranga', label: 'Murang\'a' },
      { value: 'kiambu', label: 'Kiambu' },

      // Rift Valley Region
      { value: 'turkana', label: 'Turkana' },
      { value: 'west-pokot', label: 'West Pokot' },
      { value: 'samburu', label: 'Samburu' },
      { value: 'trans-nzoia', label: 'Trans Nzoia' },
      { value: 'uasin-gishu', label: 'Uasin Gishu' },
      { value: 'elgeyo-marakwet', label: 'Elgeyo-Marakwet' },
      { value: 'nandi', label: 'Nandi' },
      { value: 'baringo', label: 'Baringo' },
      { value: 'laikipia', label: 'Laikipia' },
      { value: 'nakuru', label: 'Nakuru' },
      { value: 'narok', label: 'Narok' },
      { value: 'kajiado', label: 'Kajiado' },
      { value: 'kericho', label: 'Kericho' },
      { value: 'bomet', label: 'Bomet' },

      // Western Region
      { value: 'kakamega', label: 'Kakamega' },
      { value: 'vihiga', label: 'Vihiga' },
      { value: 'bungoma', label: 'Bungoma' },
      { value: 'busia-kenya', label: 'Busia' },

      // Nyanza Region
      { value: 'siaya', label: 'Siaya' },
      { value: 'kisumu', label: 'Kisumu' },
      { value: 'homabay', label: 'Homa Bay' },
      { value: 'migori', label: 'Migori' },
      { value: 'kisii', label: 'Kisii' },
      { value: 'nyamira', label: 'Nyamira' }
    ],
    sectors: {
      'nairobi': [
        { value: 'cbd', label: 'Central Business District' },
        { value: 'dagoretti', label: 'Dagoretti' },
        { value: 'embakasi', label: 'Embakasi' },
        { value: 'kasarani', label: 'Kasarani' },
        { value: 'kibra', label: 'Kibra' },
        { value: 'langata', label: 'Lang\'ata' },
        { value: 'mathare', label: 'Mathare' },
        { value: 'roysambu', label: 'Roysambu' },
        { value: 'runda', label: 'Runda' },
        { value: 'starehe', label: 'Starehe' },
        { value: 'westlands', label: 'Westlands' }
      ],
      'mombasa': [
        { value: 'changamwe', label: 'Changamwe' },
        { value: 'jomvu', label: 'Jomvu' },
        { value: 'kisauni', label: 'Kisauni' },
        { value: 'likoni', label: 'Likoni' },
        { value: 'mvita', label: 'Mvita' },
        { value: 'nyali', label: 'Nyali' }
      ],
      'kwale': [
        { value: 'msambweni', label: 'Msambweni' },
        { value: 'lunga-lunga', label: 'Lunga Lunga' },
        { value: 'matuga', label: 'Matuga' },
        { value: 'kinango', label: 'Kinango' }
      ],
      'kilifi': [
        { value: 'kilifi-north', label: 'Kilifi North' },
        { value: 'kilifi-south', label: 'Kilifi South' },
        { value: 'kaloleni', label: 'Kaloleni' },
        { value: 'rabai', label: 'Rabai' },
        { value: 'ganze', label: 'Ganze' },
        { value: 'malindi', label: 'Malindi' },
        { value: 'magarini', label: 'Magarini' }
      ],
      'nakuru': [
        { value: 'nakuru-town', label: 'Nakuru Town' },
        { value: 'nakuru-east', label: 'Nakuru East' },
        { value: 'nakuru-north', label: 'Nakuru North' },
        { value: 'nakuru-west', label: 'Nakuru West' },
        { value: 'rongai', label: 'Rongai' },
        { value: 'subukia', label: 'Subukia' }
      ],
      'uasin-gishu': [
        { value: 'moiben', label: 'Moiben' },
        { value: 'ainabkoi', label: 'Ainabkoi' },
        { value: 'kapseret', label: 'Kapseret' },
        { value: 'kesses', label: 'Kesses' },
        { value: 'soy', label: 'Soy' },
        { value: 'turbo', label: 'Turbo' }
      ],
      'kisumu': [
        { value: 'kisumu-central', label: 'Kisumu Central' },
        { value: 'kisumu-east', label: 'Kisumu East' },
        { value: 'kisumu-west', label: 'Kisumu West' },
        { value: 'muhoroni', label: 'Muhoroni' },
        { value: 'nyakach', label: 'Nyakach' },
        { value: 'nyando', label: 'Nyando' },
        { value: 'seme', label: 'Seme' }
      ],
      'kakamega': [
        { value: 'kakamega-central', label: 'Kakamega Central' },
        { value: 'kakamega-east', label: 'Kakamega East' },
        { value: 'kakamega-north', label: 'Kakamega North' },
        { value: 'kakamega-south', label: 'Kakamega South' },
        { value: 'lugari', label: 'Lugari' },
        { value: 'malava', label: 'Malava' },
        { value: 'mumias', label: 'Mumias' },
        { value: 'navakholo', label: 'Navakholo' }
      ],
      'meru': [
        { value: 'buuri', label: 'Buuri' },
        { value: 'igembe-central', label: 'Igembe Central' },
        { value: 'igembe-north', label: 'Igembe North' },
        { value: 'igembe-south', label: 'Igembe South' },
        { value: 'meru-central', label: 'Meru Central' },
        { value: 'tigania-east', label: 'Tigania East' },
        { value: 'tigania-west', label: 'Tigania West' }
      ],
      'kitui': [
        { value: 'kitui-central', label: 'Kitui Central' },
        { value: 'kitui-east', label: 'Kitui East' },
        { value: 'kitui-south', label: 'Kitui South' },
        { value: 'kitui-west', label: 'Kitui West' },
        { value: 'mwingi-central', label: 'Mwingi Central' },
        { value: 'mwingi-north', label: 'Mwingi North' },
        { value: 'mwingi-west', label: 'Mwingi West' }
      ],
      'embu': [
        { value: 'embu-east', label: 'Embu East' },
        { value: 'embu-north', label: 'Embu North' },
        { value: 'embu-west', label: 'Embu West' },
        { value: 'mbeere-north', label: 'Mbeere North' },
        { value: 'mbeere-south', label: 'Mbeere South' }
      ],
      'tharaka-nithi': [
        { value: 'tharaka-north', label: 'Tharaka North' },
        { value: 'tharaka-south', label: 'Tharaka South' },
        { value: 'maara', label: 'Maara' },
        { value: 'chuka', label: 'Chuka' }
      ],
      'marsabit': [
        { value: 'marsabit-central', label: 'Marsabit Central' },
        { value: 'marsabit-north', label: 'Marsabit North' },
        { value: 'marsabit-south', label: 'Marsabit South' },
        { value: 'chalbi', label: 'Chalbi' },
        { value: 'loyangalani', label: 'Loyangalani' },
        { value: 'maikona', label: 'Maikona' }
      ],
      'isiolo': [
        { value: 'isiolo-north', label: 'Isiolo North' },
        { value: 'isiolo-south', label: 'Isiolo South' },
        { value: 'merti', label: 'Merti' },
        { value: 'garba-tulla', label: 'Garba Tulla' }
      ],
      'machakos': [
        { value: 'kalama', label: 'Kalama' },
        { value: 'machakos-town', label: 'Machakos Town' },
        { value: 'masii', label: 'Masii' },
        { value: 'mua', label: 'Mua' },
        { value: 'mwala', label: 'Mwala' },
        { value: 'yatta', label: 'Yatta' }
      ],
      'kiambu': [
        { value: 'gatundu-north', label: 'Gatundu North' },
        { value: 'gatundu-south', label: 'Gatundu South' },
        { value: 'githunguri', label: 'Githunguri' },
        { value: 'juja', label: 'Juja' },
        { value: 'kabete', label: 'Kabete' },
        { value: 'kiambaa', label: 'Kiambaa' },
        { value: 'kiambu-town', label: 'Kiambu Town' },
        { value: 'kikuyu', label: 'Kikuyu' },
        { value: 'limuru', label: 'Limuru' },
        { value: 'ruiru', label: 'Ruiru' },
        { value: 'thika-town', label: 'Thika Town' }
      ],
      'nyeri': [
        { value: 'mathira-east', label: 'Mathira East' },
        { value: 'mathira-west', label: 'Mathira West' },
        { value: 'mukurweini', label: 'Mukurweini' },
        { value: 'nyeri-central', label: 'Nyeri Central' },
        { value: 'nyeri-south', label: 'Nyeri South' },
        { value: 'tetu', label: 'Tetu' }
      ]
    }
  },

  // Tanzania
  'Tanzania': {
    districts: [
      // Mainland Tanzania Regions
      { value: 'arusha', label: 'Arusha' },
      { value: 'dar-es-salaam', label: 'Dar es Salaam' },
      { value: 'dodoma', label: 'Dodoma' },
      { value: 'geita', label: 'Geita' },
      { value: 'iringa', label: 'Iringa' },
      { value: 'kagera', label: 'Kagera' },
      { value: 'katavi', label: 'Katavi' },
      { value: 'kigoma', label: 'Kigoma' },
      { value: 'kilimanjaro', label: 'Kilimanjaro' },
      { value: 'lindi', label: 'Lindi' },
      { value: 'manyara', label: 'Manyara' },
      { value: 'mara', label: 'Mara' },
      { value: 'mbeya', label: 'Mbeya' },
      { value: 'mjini-magharibi', label: 'Mjini Magharibi (Zanzibar Urban West)' },
      { value: 'morogoro', label: 'Morogoro' },
      { value: 'mtwara', label: 'Mtwara' },
      { value: 'mwanza', label: 'Mwanza' },
      { value: 'njombe', label: 'Njombe' },
      { value: 'pemba-kaskazini', label: 'Pemba Kaskazini (Pemba North)' },
      { value: 'pemba-kusini', label: 'Pemba Kusini (Pemba South)' },
      { value: 'pwani', label: 'Pwani' },
      { value: 'rukwa', label: 'Rukwa' },
      { value: 'ruvuma', label: 'Ruvuma' },
      { value: 'shinyanga', label: 'Shinyanga' },
      { value: 'simiyu', label: 'Simiyu' },
      { value: 'singida', label: 'Singida' },
      { value: 'songwe', label: 'Songwe' },
      { value: 'tabora', label: 'Tabora' },
      { value: 'tanga', label: 'Tanga' },

      // Zanzibar Regions
      { value: 'zanzibar-north', label: 'Zanzibar North' },
      { value: 'zanzibar-south', label: 'Zanzibar South' },
      { value: 'zanzibar-west', label: 'Zanzibar West' }
    ],
    sectors: {
      'dar-es-salaam': [
        { value: 'ilala', label: 'Ilala' },
        { value: 'kinondoni', label: 'Kinondoni' },
        { value: 'temeke', label: 'Temeke' },
        { value: 'kigamboni', label: 'Kigamboni' },
        { value: 'ubungo', label: 'Ubungo' }
      ],
      'arusha': [
        { value: 'arusha-urban', label: 'Arusha Urban' },
        { value: 'arumeru', label: 'Arumeru' },
        { value: 'karatu', label: 'Karatu' },
        { value: 'longido', label: 'Longido' },
        { value: 'monduli', label: 'Monduli' },
        { value: 'ngorongoro', label: 'Ngorongoro' }
      ],
      'mwanza': [
        { value: 'ilemela', label: 'Ilemela' },
        { value: 'nyamagana', label: 'Nyamagana' },
        { value: 'geita', label: 'Geita' },
        { value: 'sengerema', label: 'Sengerema' },
        { value: 'buchosa', label: 'Buchosa' },
        { value: 'magu', label: 'Magu' },
        { value: 'kwimba', label: 'Kwimba' },
        { value: 'misungwi', label: 'Misungwi' }
      ],
      'dodoma': [
        { value: 'dodoma-urban', label: 'Dodoma Urban' },
        { value: 'bahati', label: 'Bahati' },
        { value: 'chamwino', label: 'Chamwino' },
        { value: 'chemba', label: 'Chemba' },
        { value: 'kondoa', label: 'Kondoa' },
        { value: 'kongwa', label: 'Kongwa' },
        { value: 'mpwapwa', label: 'Mpwapwa' }
      ],
      'mbeya': [
        { value: 'mbeya-urban', label: 'Mbeya Urban' },
        { value: 'chunya', label: 'Chunya' },
        { value: 'ileje', label: 'Ileje' },
        { value: 'kyela', label: 'Kyela' },
        { value: 'mbeya-rural', label: 'Mbeya Rural' },
        { value: 'momba', label: 'Momba' },
        { value: 'rukwa', label: 'Rukwa' },
        { value: 'songwe', label: 'Songwe' }
      ],
      'morogoro': [
        { value: 'morogoro-urban', label: 'Morogoro Urban' },
        { value: 'gairo', label: 'Gairo' },
        { value: 'kilombero', label: 'Kilombero' },
        { value: 'kilosa', label: 'Kilosa' },
        { value: 'malinyi', label: 'Malinyi' },
        { value: 'mvimba', label: 'Mvimba' },
        { value: 'ulanga', label: 'Ulanga' }
      ],
      'tanga': [
        { value: 'tanga-urban', label: 'Tanga Urban' },
        { value: 'handeni', label: 'Handeni' },
        { value: 'kilindi', label: 'Kilindi' },
        { value: 'korogwe', label: 'Korogwe' },
        { value: 'lushoto', label: 'Lushoto' },
        { value: 'muheza', label: 'Muheza' },
        { value: 'pangani', label: 'Pangani' }
      ],
      'kigoma': [
        { value: 'kigoma-urban', label: 'Kigoma Urban' },
        { value: 'kasulu', label: 'Kasulu' },
        { value: 'kakonko', label: 'Kakonko' },
        { value: 'kibondo', label: 'Kibondo' },
        { value: 'buhigwe', label: 'Buhigwe' },
        { value: 'uvinza', label: 'Uvinza' }
      ],
      'zanzibar-north': [
        { value: 'kaskazini-a', label: 'Kaskazini A' },
        { value: 'kaskazini-b', label: 'Kaskazini B' }
      ],
      'zanzibar-south': [
        { value: 'kusini', label: 'Kusini' }
      ],
      'zanzibar-west': [
        { value: 'mjini', label: 'Mjini' }
      ]
    }
  },

  // Democratic Republic of Congo
  'DRC': {
    districts: [
      { value: 'kinshasa', label: 'Kinshasa' },
      { value: 'kongo-central', label: 'Kongo Central' },
      { value: 'kwango', label: 'Kwango' },
      { value: 'kwilu', label: 'Kwilu' },
      { value: 'mai-ndombe', label: 'Mai-Ndombe' },
      { value: 'kasai', label: 'Kasai' },
      { value: 'kasai-central', label: 'Kasai Central' },
      { value: 'kasai-oriental', label: 'Kasai Oriental' },
      { value: 'lomami', label: 'Lomami' },
      { value: 'sankuru', label: 'Sankuru' },
      { value: 'maniema', label: 'Maniema' },
      { value: 'sud-kivu', label: 'Sud-Kivu' },
      { value: 'nord-kivu', label: 'Nord-Kivu' },
      { value: 'ituri', label: 'Ituri' },
      { value: 'haut-uele', label: 'Haut-Uele' },
      { value: 'bas-uele', label: 'Bas-Uele' },
      { value: 'nord-ubangi', label: 'Nord-Ubangi' },
      { value: 'sud-ubangi', label: 'Sud-Ubangi' },
      { value: 'equateur', label: 'Équateur' },
      { value: 'tsuapa', label: 'Tshuapa' },
      { value: 'mongala', label: 'Mongala' },
      { value: 'haut-katanga', label: 'Haut-Katanga' },
      { value: 'lualaba', label: 'Lualaba' },
      { value: 'haut-lomami', label: 'Haut-Lomami' },
      { value: 'tanganyika', label: 'Tanganyika' }
    ],
    sectors: {
      'kinshasa': [
        { value: 'bandalungwa', label: 'Bandalungwa' },
        { value: 'barumbu', label: 'Barumbu' },
        { value: 'bumbu', label: 'Bumbu' },
        { value: 'gombe', label: 'Gombe' },
        { value: 'kalamu', label: 'Kalamu' },
        { value: 'kasa-vubu', label: 'Kasa-Vubu' },
        { value: 'kimbanseke', label: 'Kimbanseke' },
        { value: 'kinshasa', label: 'Kinshasa' },
        { value: 'kintambo', label: 'Kintambo' },
        { value: 'kisenso', label: 'Kisenso' },
        { value: 'lemba', label: 'Lemba' },
        { value: 'limete', label: 'Limete' },
        { value: 'lingwala', label: 'Lingwala' },
        { value: 'makala', label: 'Makala' },
        { value: 'maluku', label: 'Maluku' },
        { value: 'masina', label: 'Masina' },
        { value: 'matete', label: 'Matete' },
        { value: 'mont-ngafula', label: 'Mont Ngafula' },
        { value: 'ndjili', label: 'N\'djili' },
        { value: 'ngaba', label: 'Ngaba' },
        { value: 'ngaliema', label: 'Ngaliema' },
        { value: 'ngiri-ngiri', label: 'Ngiri-Ngiri' },
        { value: 'nsele', label: 'Nsele' },
        { value: 'selembao', label: 'Selembao' }
      ],
      'nord-kivu': [
        { value: 'goma', label: 'Goma' },
        { value: 'beni', label: 'Beni' },
        { value: 'butembo', label: 'Butembo' },
        { value: 'lubero', label: 'Lubero' },
        { value: 'rutshuru', label: 'Rutshuru' },
        { value: 'masisi', label: 'Masisi' },
        { value: 'walikale', label: 'Walikale' },
        { value: 'nyiragongo', label: 'Nyiragongo' },
        { value: 'karisimbi', label: 'Karisimbi' }
      ],
      'sud-kivu': [
        { value: 'bukavu', label: 'Bukavu' },
        { value: 'uvita', label: 'Uvira' },
        { value: 'baraka', label: 'Baraka' },
        { value: 'fizi', label: 'Fizi' },
        { value: 'idjwi', label: 'Idjwi' },
        { value: 'kabare', label: 'Kabare' },
        { value: 'kalehe', label: 'Kalehe' },
        { value: 'mwenga', label: 'Mwenga' },
        { value: 'shabunda', label: 'Shabunda' },
        { value: 'walungu', label: 'Walungu' }
      ]
    }
  },

  // South Sudan
  'South Sudan': {
    districts: [
      { value: 'central-equatoria', label: 'Central Equatoria' },
      { value: 'eastern-equatoria', label: 'Eastern Equatoria' },
      { value: 'western-equatoria', label: 'Western Equatoria' },
      { value: 'lakes', label: 'Lakes' },
      { value: 'northern-bahr-el-ghazal', label: 'Northern Bahr el Ghazal' },
      { value: 'western-bahr-el-ghazal', label: 'Western Bahr el Ghazal' },
      { value: 'juba', label: 'Juba' },
      { value: 'warrap', label: 'Warrap' },
      { value: 'unity', label: 'Unity' },
      { value: 'upper-nile', label: 'Upper Nile' },
      { value: 'jonglei', label: 'Jonglei' }
    ],
    sectors: {
      'central-equatoria': [
        { value: 'juba', label: 'Juba' },
        { value: 'kajo-keji', label: 'Kajo Keji' },
        { value: 'liria', label: 'Liria' },
        { value: 'terekeka', label: 'Terekeka' },
        { value: 'yambio', label: 'Yambio' },
        { value: 'yei', label: 'Yei' }
      ],
      'juba': [
        { value: 'juba-town', label: 'Juba Town' },
        { value: 'munuki', label: 'Munuki' },
        { value: 'kator', label: 'Kator' },
        { value: 'rejon', label: 'Rejon' }
      ]
    }
  },

  // Ethiopia
  'Ethiopia': {
    districts: [
      { value: 'addis-ababa', label: 'Addis Ababa' },
      { value: 'afar', label: 'Afar' },
      { value: 'amhara', label: 'Amhara' },
      { value: 'benishangul-gumuz', label: 'Benishangul-Gumuz' },
      { value: 'dire-dawa', label: 'Dire Dawa' },
      { value: 'gambela', label: 'Gambela' },
      { value: 'harari', label: 'Harari' },
      { value: 'oromia', label: 'Oromia' },
      { value: 'somali', label: 'Somali' },
      { value: 'southern-nations', label: 'Southern Nations, Nationalities and Peoples' },
      { value: 'tigray', label: 'Tigray' }
    ],
    sectors: {
      'addis-ababa': [
        { value: 'addis-ketema', label: 'Addis Ketema' },
        { value: 'akaky-kaliti', label: 'Akaky Kaliti' },
        { value: 'arada', label: 'Arada' },
        { value: 'bole', label: 'Bole' },
        { value: 'gullele', label: 'Gullele' },
        { value: 'kirkos', label: 'Kirkos' },
        { value: 'kolfe-keranio', label: 'Kolfe Keranio' },
        { value: 'lideta', label: 'Lideta' },
        { value: 'nifas-silk-lafto', label: 'Nifas Silk-Lafto' },
        { value: 'yeka', label: 'Yeka' }
      ],
      'oromia': [
        { value: 'jimma', label: 'Jimma' },
        { value: 'nekemte', label: 'Nekemte' },
        { value: 'ambo', label: 'Ambo' },
        { value: 'shashamene', label: 'Shashamene' },
        { value: 'bishoftu', label: 'Bishoftu' },
        { value: 'burayu', label: 'Burayu' },
        { value: 'adaama', label: 'Adaama' },
        { value: 'sebeta', label: 'Sebeta' },
        { value: 'waliso', label: 'Waliso' },
        { value: 'fiche', label: 'Fiche' }
      ],
      'amhara': [
        { value: 'bahir-dar', label: 'Bahir Dar' },
        { value: 'gondar', label: 'Gondar' },
        { value: 'dessie', label: 'Dessie' },
        { value: 'kombolcha', label: 'Kombolcha' },
        { value: 'debre-marqos', label: 'Debre Marqos' },
        { value: 'debre-tabor', label: 'Debre Tabor' },
        { value: 'lalibela', label: 'Lalibela' },
        { value: 'woldiya', label: 'Woldiya' }
      ]
    }
  },

  // Somalia
  'Somalia': {
    districts: [
      { value: 'banaadir', label: 'Banaadir' },
      { value: 'galmudug', label: 'Galmudug' },
      { value: 'hirshabelle', label: 'Hirshabelle' },
      { value: 'jubaland', label: 'Jubaland' },
      { value: 'puntland', label: 'Puntland' },
      { value: 'southwest', label: 'Southwest' },
      { value: 'somaliland', label: 'Somaliland' }
    ],
    sectors: {
      'banaadir': [
        { value: 'mogadishu', label: 'Mogadishu' },
        { value: 'hodan', label: 'Hodan' },
        { value: 'hawl-wadaag', label: 'Hawl Wadaag' },
        { value: 'shibis', label: 'Shibis' },
        { value: 'wadajir', label: 'Wadajir' },
        { value: 'yaqshid', label: 'Yaqshid' }
      ],
      'puntland': [
        { value: 'gariisa', label: 'Gariisa' },
        { value: 'mudug', label: 'Mudug' },
        { value: 'nugaal', label: 'Nugaal' },
        { value: 'bari', label: 'Bari' },
        { value: 'sool', label: 'Sool' },
        { value: 'sanaag', label: 'Sanaag' },
        { value: 'togdheer', label: 'Togdheer' },
        { value: 'woqooyi-galbeed', label: 'Woqooyi Galbeed' }
      ]
    }
  },

  // Malawi
  'Malawi': {
    districts: [
      { value: 'central-region', label: 'Central Region' },
      { value: 'northern-region', label: 'Northern Region' },
      { value: 'southern-region', label: 'Southern Region' }
    ],
    sectors: {
      'central-region': [
        { value: 'lilongwe', label: 'Lilongwe' },
        { value: 'mchinji', label: 'Mchinji' },
        { value: 'kasungu', label: 'Kasungu' },
        { value: 'nkhotakota', label: 'Nkhotakota' },
        { value: 'ntchisi', label: 'Ntchisi' },
        { value: 'dedza', label: 'Dedza' },
        { value: 'dowa', label: 'Dowa' },
        { value: 'salima', label: 'Salima' }
      ],
      'southern-region': [
        { value: 'blantyre', label: 'Blantyre' },
        { value: 'zomba', label: 'Zomba' },
        { value: 'mangochi', label: 'Mangochi' },
        { value: 'mulanje', label: 'Mulanje' },
        { value: 'thyolo', label: 'Thyolo' },
        { value: 'chikwawa', label: 'Chikwawa' },
        { value: 'nsanje', label: 'Nsanje' },
        { value: 'balaka', label: 'Balaka' },
        { value: 'machiga', label: 'Machiga' },
        { value: 'chiradzulu', label: 'Chiradzulu' }
      ],
      'northern-region': [
        { value: 'mzuzu', label: 'Mzuzu' },
        { value: 'rumphi', label: 'Rumphi' },
        { value: 'karonga', label: 'Karonga' },
        { value: 'nkhatabay', label: 'Nkhatabay' },
        { value: 'likoma', label: 'Likoma' },
        { value: 'chitipa', label: 'Chitipa' }
      ]
    }
  },

  // Zambia
  'Zambia': {
    districts: [
      { value: 'lusaka', label: 'Lusaka' },
      { value: 'copperbelt', label: 'Copperbelt' },
      { value: 'central', label: 'Central' },
      { value: 'eastern', label: 'Eastern' },
      { value: 'luapula', label: 'Luapula' },
      { value: 'muchinga', label: 'Muchinga' },
      { value: 'northern', label: 'Northern' },
      { value: 'north-western', label: 'North-Western' },
      { value: 'southern', label: 'Southern' },
      { value: 'western', label: 'Western' }
    ],
    sectors: {
      'lusaka': [
        { value: 'lusaka-central', label: 'Lusaka Central' },
        { value: 'lusaka-east', label: 'Lusaka East' },
        { value: 'lusaka-west', label: 'Lusaka West' },
        { value: 'chongwe', label: 'Chongwe' },
        { value: 'kafue', label: 'Kafue' },
        { value: 'luangwa', label: 'Luangwa' },
        { value: 'rufunsa', label: 'Rufunsa' }
      ],
      'copperbelt': [
        { value: 'ndola', label: 'Ndola' },
        { value: 'kitwe', label: 'Kitwe' },
        { value: 'chingola', label: 'Chingola' },
        { value: 'mufulira', label: 'Mufulira' },
        { value: 'luanshya', label: 'Luanshya' },
        { value: 'kalulushi', label: 'Kalulushi' },
        { value: 'chililabombwe', label: 'Chililabombwe' },
        { value: 'masaiti', label: 'Masaiti' },
        { value: 'mpongwe', label: 'Mpongwe' },
        { value: 'lwanshya', label: 'Lwanshya' }
      ]
    }
  },

  // Zimbabwe
  'Zimbabwe': {
    districts: [
      { value: 'harare', label: 'Harare' },
      { value: 'bulawayo', label: 'Bulawayo' },
      { value: 'manicaland', label: 'Manicaland' },
      { value: 'mashonaland-central', label: 'Mashonaland Central' },
      { value: 'mashonaland-east', label: 'Mashonaland East' },
      { value: 'mashonaland-west', label: 'Mashonaland West' },
      { value: 'masvingo', label: 'Masvingo' },
      { value: 'matabeleland-north', label: 'Matabeleland North' },
      { value: 'matabeleland-south', label: 'Matabeleland South' },
      { value: 'midlands', label: 'Midlands' }
    ],
    sectors: {
      'harare': [
        { value: 'harare-central', label: 'Harare Central' },
        { value: 'harare-east', label: 'Harare East' },
        { value: 'harare-north', label: 'Harare North' },
        { value: 'harare-south', label: 'Harare South' },
        { value: 'harare-west', label: 'Harare West' },
        { value: 'chitungwiza', label: 'Chitungwiza' },
        { value: 'epworth', label: 'Epworth' }
      ],
      'bulawayo': [
        { value: 'bulawayo-central', label: 'Bulawayo Central' },
        { value: 'bulawayo-east', label: 'Bulawayo East' },
        { value: 'bulawayo-south', label: 'Bulawayo South' },
        { value: 'bulawayo-west', label: 'Bulawayo West' }
      ]
    }
  },

  // Nigeria
  'Nigeria': {
    districts: [
      { value: 'abuja-fct', label: 'Abuja Federal Capital Territory' },
      { value: 'abia', label: 'Abia' },
      { value: 'adamawa', label: 'Adamawa' },
      { value: 'akwa-ibom', label: 'Akwa Ibom' },
      { value: 'anambra', label: 'Anambra' },
      { value: 'bauchi', label: 'Bauchi' },
      { value: 'bayelsa', label: 'Bayelsa' },
      { value: 'benue', label: 'Benue' },
      { value: 'borno', label: 'Borno' },
      { value: 'cross-river', label: 'Cross River' },
      { value: 'delta', label: 'Delta' },
      { value: 'ebonyi', label: 'Ebonyi' },
      { value: 'edo', label: 'Edo' },
      { value: 'ekiti', label: 'Ekiti' },
      { value: 'enugu', label: 'Enugu' },
      { value: 'gombe', label: 'Gombe' },
      { value: 'imo', label: 'Imo' },
      { value: 'jigawa', label: 'Jigawa' },
      { value: 'kaduna', label: 'Kaduna' },
      { value: 'kano', label: 'Kano' },
      { value: 'katsina', label: 'Katsina' },
      { value: 'kebbi', label: 'Kebbi' },
      { value: 'kogi', label: 'Kogi' },
      { value: 'kwara', label: 'Kwara' },
      { value: 'lagos', label: 'Lagos' },
      { value: 'nasarawa', label: 'Nasarawa' },
      { value: 'niger', label: 'Niger' },
      { value: 'ogun', label: 'Ogun' },
      { value: 'ondo', label: 'Ondo' },
      { value: 'osun', label: 'Osun' },
      { value: 'oyo', label: 'Oyo' },
      { value: 'plateau', label: 'Plateau' },
      { value: 'rivers', label: 'Rivers' },
      { value: 'sokoto', label: 'Sokoto' },
      { value: 'taraba', label: 'Taraba' },
      { value: 'yobe', label: 'Yobe' },
      { value: 'zamfara', label: 'Zamfara' }
    ],
    sectors: {
      'lagos': [
        { value: 'agege', label: 'Agege' },
        { value: 'ajeromi-ifelodun', label: 'Ajeromi-Ifelodun' },
        { value: 'alimosho', label: 'Alimosho' },
        { value: 'amuwo-odofin', label: 'Amuwo-Odofin' },
        { value: 'apapa', label: 'Apapa' },
        { value: 'badagry', label: 'Badagry' },
        { value: 'eti-osa', label: 'Eti-Osa' },
        { value: 'ibeju-lekki', label: 'Ibeju-Lekki' },
        { value: 'ifako-ijaiye', label: 'Ifako-Ijaiye' },
        { value: 'ikeja', label: 'Ikeja' },
        { value: 'ikorodu', label: 'Ikorodu' },
        { value: 'kosofe', label: 'Kosofe' },
        { value: 'lagos-island', label: 'Lagos Island' },
        { value: 'lagos-mainland', label: 'Lagos Mainland' },
        { value: 'mushin', label: 'Mushin' },
        { value: 'oshodi-isolo', label: 'Oshodi-Isolo' },
        { value: 'shomolu', label: 'Shomolu' },
        { value: 'surulere', label: 'Surulere' }
      ],
      'kano': [
        { value: 'kano-central', label: 'Kano Central' },
        { value: 'kano-east', label: 'Kano East' },
        { value: 'kano-north', label: 'Kano North' },
        { value: 'kano-south', label: 'Kano South' },
        { value: 'kano-west', label: 'Kano West' }
      ]
    }
  },

  // Ghana
  'Ghana': {
    districts: [
      { value: 'greater-accra', label: 'Greater Accra' },
      { value: 'ashanti', label: 'Ashanti' },
      { value: 'central', label: 'Central' },
      { value: 'eastern', label: 'Eastern' },
      { value: 'western', label: 'Western' },
      { value: 'volta', label: 'Volta' },
      { value: 'northern', label: 'Northern' },
      { value: 'upper-east', label: 'Upper East' },
      { value: 'upper-west', label: 'Upper West' },
      { value: 'brong-ahafo', label: 'Brong Ahafo' },
      { value: 'bono', label: 'Bono' },
      { value: 'ahafo', label: 'Ahafo' },
      { value: 'savannah', label: 'Savannah' },
      { value: 'north-east', label: 'North East' },
      { value: 'oti', label: 'Oti' }
    ],
    sectors: {
      'greater-accra': [
        { value: 'accra', label: 'Accra' },
        { value: 'tema', label: 'Tema' },
        { value: 'ga-east', label: 'Ga East' },
        { value: 'ga-west', label: 'Ga West' },
        { value: 'ga-central', label: 'Ga Central' },
        { value: 'ga-north', label: 'Ga North' },
        { value: 'ga-south', label: 'Ga South' },
        { value: 'adentan', label: 'Adentan' },
        { value: 'ashaiman', label: 'Ashaiman' },
        { value: 'ledzokuku', label: 'Ledzokuku' },
        { value: 'krowor', label: 'Krowor' },
        { value: 'osuklottey', label: 'Osuklottey' }
      ],
      'ashanti': [
        { value: 'kumasi', label: 'Kumasi' },
        { value: 'obuasi', label: 'Obuasi' },
        { value: 'ejisu', label: 'Ejisu' },
        { value: 'bekwai', label: 'Bekwai' },
        { value: 'mampong', label: 'Mampong' },
        { value: 'effiduase', label: 'Effiduase' },
        { value: 'konongo', label: 'Konongo' }
      ]
    }
  },

  // Default fallback for other countries
  'Other': {
    districts: [
      { value: 'other', label: 'Please specify in next field' }
    ]
  }
};

// Helper functions for location data
export const getDistrictsForCountry = (country: string): LocationOption[] => {
  return LOCATION_DATA[country]?.districts || LOCATION_DATA['Other'].districts;
};

export const getSectorsForDistrict = (country: string, district: string): LocationOption[] => {
  return LOCATION_DATA[country]?.sectors?.[district] || [];
};

export const getCellsForSector = (country: string, sector: string): LocationOption[] => {
  return LOCATION_DATA[country]?.cells?.[sector] || [];
};

export const getVillagesForCell = (country: string, cell: string): LocationOption[] => {
  // Villages are nested under cells -> sectors -> districts -> country
  // First get the country data
  const countryData = LOCATION_DATA[country];
  if (!countryData || !countryData.villages) {
    return [];
  }

  // Return villages for the specified cell
  return countryData.villages[cell] || [];
};

// Common districts for international locations
export const getCommonDistricts = (): LocationOption[] => [
  { value: 'central', label: 'Central' },
  { value: 'northern', label: 'Northern' },
  { value: 'southern', label: 'Southern' },
  { value: 'eastern', label: 'Eastern' },
  { value: 'western', label: 'Western' },
  { value: 'downtown', label: 'Downtown' },
  { value: 'suburb', label: 'Suburb' },
  { value: 'rural', label: 'Rural' },
  { value: 'other', label: 'Other' }
];

export const getCommonSectors = (): LocationOption[] => [
  { value: 'city-center', label: 'City Center' },
  { value: 'residential', label: 'Residential Area' },
  { value: 'commercial', label: 'Commercial Area' },
  { value: 'industrial', label: 'Industrial Area' },
  { value: 'university', label: 'University Area' },
  { value: 'hospital', label: 'Hospital Area' },
  { value: 'airport', label: 'Airport Area' },
  { value: 'other', label: 'Other' }
];