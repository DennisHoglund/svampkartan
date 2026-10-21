// Arter som går att välja vid ett fynd. id sparas i databasen, namn och färg används i appen.
window.SVAMP_ARTER = [
  { id: 'kantarell',      namn: 'Kantarell',             farg: '#E8A317' },
  { id: 'trattkantarell', namn: 'Trattkantarell',        farg: '#9C7A3C' },
  { id: 'svart_trumpet',  namn: 'Svart trumpetsvamp',    farg: '#4A4A4A' },
  { id: 'karljohan',      namn: 'Karljohan',             farg: '#7A4A1F' },
  { id: 'sopp_ovrig',     namn: 'Annan sopp',            farg: '#A0522D' },
  { id: 'blodriska',      namn: 'Blodriska',             farg: '#D2691E' },
  { id: 'farticka', namn: 'Fårticka',              farg: '#D8C08A' },
  { id: 'taggsvamp',      namn: 'Blek taggsvamp',        farg: '#E3B778' },
  { id: 'kremla',         namn: 'Kremla',                farg: '#B5462E' },
  { id: 'rodgul_trumpet', namn: 'Rödgul trumpetsvamp',   farg: '#C9822B' },
  { id: 'murkla',         namn: 'Murkla',                farg: '#6B4E3D' },
  { id: 'annan',          namn: 'Annan',                 farg: '#7E8C5A' }
];

window.svampArt = function (id) {
  return window.SVAMP_ARTER.find((a) => a.id === id) ||
         { id, namn: id || 'Okänd', farg: '#7E8C5A' };
};
