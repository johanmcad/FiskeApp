import { FishSpecies } from '@/types'

export const fishSpecies: FishSpecies[] = [
  // Sötvattensfiskar
  { id: 'abborre', swedishName: 'Abborre', latinName: 'Perca fluviatilis', category: 'freshwater' },
  { id: 'gadda', swedishName: 'Gädda', latinName: 'Esox lucius', category: 'freshwater', minSizeCm: 40 },
  { id: 'gos', swedishName: 'Gös', latinName: 'Sander lucioperca', category: 'freshwater', minSizeCm: 40 },
  { id: 'oring', swedishName: 'Öring', latinName: 'Salmo trutta', category: 'both', minSizeCm: 35 },
  { id: 'regnbage', swedishName: 'Regnbåge', latinName: 'Oncorhynchus mykiss', category: 'freshwater' },
  { id: 'lax', swedishName: 'Lax', latinName: 'Salmo salar', category: 'both', minSizeCm: 50 },
  { id: 'roding', swedishName: 'Röding', latinName: 'Salvelinus alpinus', category: 'freshwater', minSizeCm: 30 },
  { id: 'harr', swedishName: 'Harr', latinName: 'Thymallus thymallus', category: 'freshwater', minSizeCm: 30 },
  { id: 'sik', swedishName: 'Sik', latinName: 'Coregonus lavaretus', category: 'freshwater' },
  { id: 'sikloja', swedishName: 'Siklöja', latinName: 'Coregonus albula', category: 'freshwater' },
  { id: 'braxen', swedishName: 'Braxen', latinName: 'Abramis brama', category: 'freshwater' },
  { id: 'mort', swedishName: 'Mört', latinName: 'Rutilus rutilus', category: 'freshwater' },
  { id: 'id', swedishName: 'Id', latinName: 'Leuciscus idus', category: 'freshwater' },
  { id: 'sutare', swedishName: 'Sutare', latinName: 'Tinca tinca', category: 'freshwater' },
  { id: 'ruda', swedishName: 'Ruda', latinName: 'Carassius carassius', category: 'freshwater' },
  { id: 'lake', swedishName: 'Lake', latinName: 'Lota lota', category: 'freshwater', minSizeCm: 40 },
  { id: 'al', swedishName: 'Ål', latinName: 'Anguilla anguilla', category: 'both' },
  { id: 'karp', swedishName: 'Karp', latinName: 'Cyprinus carpio', category: 'freshwater' },
  { id: 'graskap', swedishName: 'Gräskarp', latinName: 'Ctenopharyngodon idella', category: 'freshwater' },
  { id: 'farna', swedishName: 'Färna', latinName: 'Squalius cephalus', category: 'freshwater' },
  { id: 'asp', swedishName: 'Asp', latinName: 'Leuciscus aspius', category: 'freshwater', minSizeCm: 40 },
  { id: 'nors', swedishName: 'Nors', latinName: 'Osmerus eperlanus', category: 'both' },
  { id: 'gors', swedishName: 'Gärs', latinName: 'Gymnocephalus cernua', category: 'freshwater' },
  { id: 'sarv', swedishName: 'Sarv', latinName: 'Scardinius erythrophthalmus', category: 'freshwater' },
  { id: 'bjorkna', swedishName: 'Björkna', latinName: 'Blicca bjoerkna', category: 'freshwater' },
  { id: 'elritsa', swedishName: 'Elritsa', latinName: 'Phoxinus phoxinus', category: 'freshwater' },
  { id: 'mal', swedishName: 'Mal', latinName: 'Silurus glanis', category: 'freshwater' },
  { id: 'nejonoga', swedishName: 'Nejonöga', latinName: 'Lampetra fluviatilis', category: 'freshwater' },
  { id: 'loja', swedishName: 'Löja', latinName: 'Alburnus alburnus', category: 'freshwater' },
  { id: 'storlake', swedishName: 'Storspigg', latinName: 'Gasterosteus aculeatus', category: 'both' },

  // Saltvattenfiskar
  { id: 'torsk', swedishName: 'Torsk', latinName: 'Gadus morhua', category: 'saltwater', minSizeCm: 35 },
  { id: 'kolja', swedishName: 'Kolja', latinName: 'Melanogrammus aeglefinus', category: 'saltwater', minSizeCm: 30 },
  { id: 'sej', swedishName: 'Sej', latinName: 'Pollachius virens', category: 'saltwater', minSizeCm: 32 },
  { id: 'lyrtorsk', swedishName: 'Lyrtorsk', latinName: 'Pollachius pollachius', category: 'saltwater' },
  { id: 'vitling', swedishName: 'Vitling', latinName: 'Merlangius merlangus', category: 'saltwater' },
  { id: 'makrill', swedishName: 'Makrill', latinName: 'Scomber scombrus', category: 'saltwater' },
  { id: 'sill', swedishName: 'Sill', latinName: 'Clupea harengus', category: 'saltwater' },
  { id: 'stromming', swedishName: 'Strömming', latinName: 'Clupea harengus membras', category: 'saltwater' },
  { id: 'havskatt', swedishName: 'Havskatt', latinName: 'Anarhichas lupus', category: 'saltwater' },
  { id: 'havsoring', swedishName: 'Havsöring', latinName: 'Salmo trutta trutta', category: 'saltwater', minSizeCm: 40 },
  { id: 'havslax', swedishName: 'Havslax', latinName: 'Salmo salar', category: 'saltwater', minSizeCm: 60 },
  { id: 'rodspatta', swedishName: 'Rödspätta', latinName: 'Pleuronectes platessa', category: 'saltwater', minSizeCm: 27 },
  { id: 'skrubbskadda', swedishName: 'Skrubbskädda', latinName: 'Platichthys flesus', category: 'saltwater' },
  { id: 'sandskadda', swedishName: 'Sandskädda', latinName: 'Limanda limanda', category: 'saltwater' },
  { id: 'tunga', swedishName: 'Tunga', latinName: 'Solea solea', category: 'saltwater', minSizeCm: 24 },
  { id: 'piggvar', swedishName: 'Piggvar', latinName: 'Scophthalmus maximus', category: 'saltwater', minSizeCm: 30 },
  { id: 'slätvar', swedishName: 'Slätvar', latinName: 'Scophthalmus rhombus', category: 'saltwater' },
  { id: 'havsabborre', swedishName: 'Havsabborre', latinName: 'Dicentrarchus labrax', category: 'saltwater', minSizeCm: 36 },
  { id: 'hornfisk', swedishName: 'Hornfisk', latinName: 'Belone belone', category: 'saltwater' },
  { id: 'berggylta', swedishName: 'Berggylta', latinName: 'Labrus bergylta', category: 'saltwater' },
  { id: 'skärsnultra', swedishName: 'Skärsnultra', latinName: 'Ctenolabrus rupestris', category: 'saltwater' },
  { id: 'stenbit', swedishName: 'Stenbit', latinName: 'Cyclopterus lumpus', category: 'saltwater' },
  { id: 'sjurygg', swedishName: 'Sjurygg', latinName: 'Cyclopterus lumpus', category: 'saltwater' },
  { id: 'pigghaj', swedishName: 'Pigghaj', latinName: 'Squalus acanthias', category: 'saltwater' },
  { id: 'slatrocka', swedishName: 'Slätrocka', latinName: 'Raja batis', category: 'saltwater' },
  { id: 'klorocka', swedishName: 'Klorocka', latinName: 'Raja clavata', category: 'saltwater' },
  { id: 'kusttobis', swedishName: 'Kusttobis', latinName: 'Ammodytes tobianus', category: 'saltwater' },
  { id: 'knot', swedishName: 'Knot', latinName: 'Eutrigla gurnardus', category: 'saltwater' },
  { id: 'fenknot', swedishName: 'Fenknot', latinName: 'Chelidonichthys lucerna', category: 'saltwater' },
  { id: 'havtasja', swedishName: 'Havstasja', latinName: 'Entelurus aequoreus', category: 'saltwater' },
  { id: 'sjostingfisk', swedishName: 'Sjustrålig smörbult', latinName: 'Gobiusculus flavescens', category: 'saltwater' },
  { id: 'svartstudsare', swedishName: 'Svart smörbult', latinName: 'Gobius niger', category: 'saltwater' },
  { id: 'lerstudsare', swedishName: 'Leråstudsare', latinName: 'Pomatoschistus microps', category: 'saltwater' },
  { id: 'simpor', swedishName: 'Oxsimpa', latinName: 'Taurulus bubalis', category: 'saltwater' },
  { id: 'skrabbe', swedishName: 'Skrubbskädda', latinName: 'Myoxocephalus scorpius', category: 'saltwater' },
  { id: 'tångsnälla', swedishName: 'Tångspigg', latinName: 'Spinachia spinachia', category: 'saltwater' },
  { id: 'tangbrosme', swedishName: 'Tångbrosme', latinName: 'Pholis gunnellus', category: 'saltwater' },
  { id: 'ansjovis', swedishName: 'Ansjovis', latinName: 'Engraulis encrasicolus', category: 'saltwater' },
  { id: 'sardin', swedishName: 'Sardin', latinName: 'Sardina pilchardus', category: 'saltwater' },
  { id: 'tonfisk', swedishName: 'Blåfenad tonfisk', latinName: 'Thunnus thynnus', category: 'saltwater' },
  { id: 'marulk', swedishName: 'Marulk', latinName: 'Lophius piscatorius', category: 'saltwater' },
  { id: 'lange', swedishName: 'Långa', latinName: 'Molva molva', category: 'saltwater' },
  { id: 'brosme', swedishName: 'Brosme', latinName: 'Brosme brosme', category: 'saltwater' },
  { id: 'kungsfisk', swedishName: 'Kungsfisk', latinName: 'Sebastes norvegicus', category: 'saltwater' },
  { id: 'liten_kungsfisk', swedishName: 'Liten kungsfisk', latinName: 'Sebastes viviparus', category: 'saltwater' },
  { id: 'havgadda', swedishName: 'Havsruda', latinName: 'Pagellus bogaraveo', category: 'saltwater' },
  { id: 'sparlakka', swedishName: 'Spärläcka', latinName: 'Brama brama', category: 'saltwater' },
]

export const getSpeciesByCategory = (category: 'freshwater' | 'saltwater' | 'both' | 'all') => {
  if (category === 'all') return fishSpecies
  if (category === 'both') return fishSpecies.filter(s => s.category === 'both')
  return fishSpecies.filter(s => s.category === category || s.category === 'both')
}

export const getSpeciesById = (id: string) => {
  return fishSpecies.find(s => s.id === id)
}

export const searchSpecies = (query: string) => {
  const lowerQuery = query.toLowerCase()
  return fishSpecies.filter(s =>
    s.swedishName.toLowerCase().includes(lowerQuery) ||
    s.latinName.toLowerCase().includes(lowerQuery)
  )
}
