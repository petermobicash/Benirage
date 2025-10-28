// Comprehensive list of nationalities for form dropdowns
export const NATIONALITIES = [
  // East African Community (EAC)
  { value: 'rwandan', label: 'Rwandan' },
  { value: 'burundian', label: 'Burundian' },
  { value: 'tanzanian', label: 'Tanzanian' },
  { value: 'ugandan', label: 'Ugandan' },
  { value: 'kenyan', label: 'Kenyan' },
  { value: 'south-sudanese', label: 'South Sudanese' },

  // Other African countries
  { value: 'angolan', label: 'Angolan' },
  { value: 'botswanan', label: 'Botswanan' },
  { value: 'congolese-drc', label: 'Congolese (DRC)' },
  { value: 'congolese-roc', label: 'Congolese (ROC)' },
  { value: 'egyptian', label: 'Egyptian' },
  { value: 'ethiopian', label: 'Ethiopian' },
  { value: 'ghanian', label: 'Ghanaian' },
  { value: 'ivorian', label: 'Ivorian' },
  { value: 'malian', label: 'Malian' },
  { value: 'moroccan', label: 'Moroccan' },
  { value: 'mozambican', label: 'Mozambican' },
  { value: 'namibian', label: 'Namibian' },
  { value: 'nigerian', label: 'Nigerian' },
  { value: 'senegalese', label: 'Senegalese' },
  { value: 'south-african', label: 'South African' },
  { value: 'sudanese', label: 'Sudanese' },
  { value: 'zambian', label: 'Zambian' },
  { value: 'zimbabwean', label: 'Zimbabwean' },

  // Other regions
  { value: 'american', label: 'American' },
  { value: 'canadian', label: 'Canadian' },
  { value: 'british', label: 'British' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'indian', label: 'Indian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'brazilian', label: 'Brazilian' },
  { value: 'australian', label: 'Australian' },
  { value: 'other', label: 'Other' }
];

// Helper function to get nationality label by value
export const getNationalityLabel = (value: string): string => {
  const nationality = NATIONALITIES.find(n => n.value === value);
  return nationality ? nationality.label : value;
};

// Helper function to get nationality value by label
export const getNationalityValue = (label: string): string => {
  const nationality = NATIONALITIES.find(n => n.label === label);
  return nationality ? nationality.value : label;
};