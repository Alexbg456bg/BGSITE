import type { Destination } from '../types'
import { LOCAL_DESTINATION_IMAGES } from './localDestinationImages'

const u = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1600&q=82`

const wiki = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1600`

/** Дестинации по slug на област — покрива всички 28 области. */
const RAW_DESTINATIONS_BY_SLUG: Record<string, Destination[]> = {
  'sofia-grad': [
    {
      id: 'dest-aleksander-nevski',
      name: 'Храм-паметник „Св. Александър Невски“',
      category: 'monument',
      shortDescription:
        'Символът на София с позлатени куполи — място за служби, органова музика и архитектурни детайли в нео-византийски стил.',
      location: 'София, център',
      image: u('photo-1526481280695-3c687fd643ed'),
      images: [
        u('photo-1526481280695-3c687fd643ed'),
        wiki('Alexander_Nevsky_Cathedral,_Sofia,_Bulgaria.jpg'),
        wiki('Alexander_Nevsky_Cathedral_interior.jpg'),
        u('photo-1549880338-65ddcdfd017b'),
      ],
      coords: { lat: 42.6957, lng: 23.3329 },
      mapsUrl: 'https://maps.google.com/?q=Alexander+Nevsky+Cathedral+Sofia',
    },
    {
      id: 'dest-boyana-church',
      name: 'Боянска църква',
      category: 'historical',
      shortDescription:
        'Средновековна църква от XIII в. с уникални стенописи — обект на световното наследство на ЮНЕСКО в подножието на Витоша.',
      location: 'София, кв. Бояна',
      image: u('photo-1549880338-65ddcdfd017b'),
      images: [
        u('photo-1549880338-65ddcdfd017b'),
        wiki('Boyana_Church,_Sofia,_Bulgaria.jpg'),
        wiki('Boyana_Church_frescoes.jpg'),
        u('photo-1566127444979-b3d2b64d6c48'),
      ],
      coords: { lat: 42.6447, lng: 23.2657 },
      mapsUrl: 'https://maps.google.com/?q=Boyana+Church',
    },
    {
      id: 'dest-nhm',
      name: 'Национален исторически музей',
      category: 'museum',
      shortDescription:
        'Една от най-значимите исторически колекции в Югоизточна Европа — тракийско златно съкровище, средновековие и етнография.',
      location: 'София, Бояна',
      image: u('photo-1566127444979-b3d2b64d6c48'),
      coords: { lat: 42.6544, lng: 23.2709 },
      mapsUrl: 'https://maps.google.com/?q=National+History+Museum+Sofia',
    },
    {
      id: 'dest-archaeological-sofia',
      name: 'Национален археологически музей',
      category: 'museum',
      shortDescription:
        'Предмети от праисторията до Средновековието — антични съкровища и експозиции в бившата джамия Буюк.',
      location: 'София',
      image: u('photo-1568667256549-088060a992c9'),
      coords: { lat: 42.6969, lng: 23.3325 },
      mapsUrl: 'https://maps.google.com/?q=National+Archaeological+Museum+Sofia',
    },
  ],
  'sofia-oblast': [
    {
      id: 'dest-vitosha',
      name: 'Природен парк „Витоша“',
      category: 'natural',
      shortDescription:
        'Черния скален ръб, поляните и зимните писти — най-посещаваният планински парк в България на минути от столицата.',
      location: 'Софийска област',
      image: u('photo-1501785888041-af3ef285b470'),
      coords: { lat: 42.5667, lng: 23.2833 },
      mapsUrl: 'https://maps.google.com/?q=Vitosha+Nature+Park',
    },
    {
      id: 'dest-iskar-gorge',
      name: 'Искърско дефиле',
      category: 'eco_trail',
      shortDescription:
        'Ждрело по река Искър със скали и влакова линия — класически маршрут за разходка и снимки.',
      location: 'Искърско дефиле',
      image: u('photo-1472214103451-9374bd1c798e'),
      coords: { lat: 42.85, lng: 23.35 },
      mapsUrl: 'https://maps.google.com/?q=Iskar+Gorge',
    },
    {
      id: 'dest-kokalyane',
      name: 'Кокалянски манастир „Св. Архангел Михаил“',
      category: 'monastery',
      shortDescription:
        'Скален манастир с панорама към Планинска — тихо място за кратък туристически поход от София.',
      location: 'Кокаляне',
      image: u('photo-1547036967-23d11aaca342'),
      coords: { lat: 42.45, lng: 23.42 },
      mapsUrl: 'https://maps.google.com/?q=Kokalyane+Monastery',
    },
    {
      id: 'dest-koprivshtitsa',
      name: 'Копривщица',
      category: 'historical',
      shortDescription:
        'Възрожденски град-музей с цветни къщи, калдъръмени улици и ключова роля в Априлското въстание.',
      location: 'Копривщица',
      image: wiki('Koprivshtitsa.jpg'),
      coords: { lat: 42.6375, lng: 24.357 },
      mapsUrl: 'https://maps.google.com/?q=Koprivshtitsa+Bulgaria',
    },
  ],
  blagoevgrad: [
    {
      id: 'dest-vihren',
      name: 'Връх Вихрен',
      category: 'natural',
      shortDescription:
        'С 2914 m Вихрен е „кралят“ на Пирин — алпийски пейзаж и предизвикателни маршрути за подготвени туристи.',
      location: 'Пирин',
      image: u('photo-1486879141951-b511622f4d8e'),
      coords: { lat: 41.7714, lng: 23.4883 },
      mapsUrl: 'https://maps.google.com/?q=Vihren+Peak',
    },
    {
      id: 'dest-banderitsa',
      name: 'Район „Бъндерица“ и езерата',
      category: 'eco_trail',
      shortDescription:
        'Тревни поляни и ледникови езера под Вихрен — емблематичен пирински маршрут през лятото.',
      location: 'Национален парк „Пирин“',
      image: u('photo-1506905925346-21bda4d32df4'),
      coords: { lat: 41.7667, lng: 23.45 },
      mapsUrl: 'https://maps.google.com/?q=Banderitsa+Hut',
    },
    {
      id: 'dest-rozhen',
      name: 'Роженски манастир',
      category: 'monastery',
      shortDescription:
        'Голям манастирски комплекс с изглед към Родопите — домакин на известния Роженски събор.',
      location: 'Рожен',
      image: u('photo-1549880338-65ddcdfd017b'),
      coords: { lat: 41.8833, lng: 23.5667 },
      mapsUrl: 'https://maps.google.com/?q=Rozhen+Monastery',
    },
    {
      id: 'dest-bansko',
      name: 'Банско',
      category: 'resort',
      shortDescription:
        'Световноизвестен ски център с автентична стара част, джамия и кулинарни фестивали.',
      location: 'Банско',
      image: u('photo-1551524164-687a55dd1126'),
      coords: { lat: 41.8383, lng: 23.4889 },
      mapsUrl: 'https://maps.google.com/?q=Bansko',
    },
    {
      id: 'dest-rila-monastery-bg',
      name: 'Рилски манастир',
      category: 'monastery',
      shortDescription:
        'Най-значимият духовен и културен символ на България — включен в списъка на ЮНЕСКО.',
      location: 'Рила',
      image: u('photo-1565008576549-57569a49371d'),
      coords: { lat: 42.1333, lng: 23.3403 },
      mapsUrl: 'https://maps.google.com/?q=Rila+Monastery',
    },
    {
      id: 'dest-melnik-pyramids',
      name: 'Мелнишки пирамиди',
      category: 'natural',
      shortDescription:
        'Пясъчни скални форми над Мелник и Рожен, с панорамни пътеки и един от най-разпознаваемите пейзажи в Пиринския край.',
      location: 'Мелник',
      image: wiki('Melnik pyramids TodorBozhinov (22).JPG'),
      coords: { lat: 41.52556, lng: 23.39472 },
      mapsUrl: 'https://maps.google.com/?q=Melnik+Pyramids',
    },
  ],
  plovdiv: [
    {
      id: 'dest-plovdiv-old',
      name: 'Античен театър и Старият град',
      category: 'historical',
      shortDescription:
        'II век н.е. амфитеатър и калдъръмени улици с възрожденски къщи — сърцето на Пловдив.',
      location: 'Пловдив',
      image: u('photo-1559827260-dc66d52bef19'),
      coords: { lat: 42.1508, lng: 24.7537 },
      mapsUrl: 'https://maps.google.com/?q=Plovdiv+Ancient+Theater',
    },
    {
      id: 'dest-bachkovo',
      name: 'Бачковски манастир',
      category: 'monastery',
      shortDescription:
        'Вторият по големина манастир в България — основаван през 1083 г., с музей и живописен двор.',
      location: 'Бачково',
      image: u('photo-1547036967-23d11aaca342'),
      coords: { lat: 41.9444, lng: 24.8447 },
      mapsUrl: 'https://maps.google.com/?q=Bachkovo+Monastery',
    },
    {
      id: 'dest-asen-fortress',
      name: 'Асенова крепост',
      category: 'historical',
      shortDescription:
        'Средновековна крепост над пролома на Чая с църква „Св. Богородица Петричка“ и панорама.',
      location: 'Асеновград',
      image: u('photo-1469474968028-56623f02e42e'),
      coords: { lat: 41.9936, lng: 24.8736 },
      mapsUrl: 'https://maps.google.com/?q=Asen%27s+Fortress',
    },
    {
      id: 'dest-museum-plovdiv',
      name: 'Регионален етнографски музей',
      category: 'museum',
      shortDescription:
        'Експозиции за бита и празниците на Тракия — в къща от Стария град.',
      location: 'Пловдив',
      image: u('photo-1578662996442-48f60103fc96'),
      coords: { lat: 42.1494, lng: 24.7514 },
      mapsUrl: 'https://maps.google.com/?q=Plovdiv+Ethnographic+Museum',
    },
    {
      id: 'dest-narechen',
      name: 'Нареченски бани',
      category: 'resort',
      shortDescription:
        'Минерални извори и горски пътеки в Родопите — спокоен уикенд извън града.',
      location: 'Нареченски бани',
      image: u('photo-1506905925346-21bda4d32df4'),
      coords: { lat: 42.35, lng: 24.75 },
      mapsUrl: 'https://maps.google.com/?q=Narechenski+Bani',
    },
    {
      id: 'dest-red-church-perushtitsa',
      name: 'Червената църква край Перущица',
      category: 'historical',
      shortDescription:
        'Раннохристиянски храм от късната античност с характерна червена тухлена зидария и силует сред полето край Перущица.',
      location: 'Перущица',
      image: wiki('Redchurchperushtitsa.jpg'),
      coords: { lat: 42.07417, lng: 24.55612 },
      mapsUrl: 'https://maps.google.com/?q=Red+Church+Perushtitsa',
    },
    {
      id: 'dest-hisarya-roman-thermae',
      name: 'Римски терми в Хисаря',
      category: 'historical',
      shortDescription:
        'Останки от античния Диоклецианополис с термални бани, крепостни стени и минерални извори в северната част на областта.',
      location: 'Хисаря',
      image: wiki('Diocletianopolis thermae 1.jpg'),
      coords: { lat: 42.50033, lng: 24.70363 },
      mapsUrl: 'https://maps.google.com/?q=Roman+Thermae+Hisarya',
    },
  ],
  varna: [
    {
      id: 'dest-varna-sea',
      name: 'Морска градина и крайбрежие',
      category: 'natural',
      shortDescription:
        'Дълга алея с алеи, фонтани и плажове — любимо място за вечерни разходки край Черно море.',
      location: 'Варна',
      image: u('photo-1437719417032-8595fd9e9dc6'),
      coords: { lat: 43.2141, lng: 27.9147 },
      mapsUrl: 'https://maps.google.com/?q=Varna+Sea+Garden',
    },
    {
      id: 'dest-aladja',
      name: 'Аладжа манастир',
      category: 'monastery',
      shortDescription:
        'Скален средновековен комплекс с килии и музей — на минути от Златни пясъци.',
      location: 'Златни пясъци',
      image: u('photo-1519904981063-b0cf448d479e'),
      coords: { lat: 43.2833, lng: 28.0167 },
      mapsUrl: 'https://maps.google.com/?q=Aladzha+Monastery',
    },
    {
      id: 'dest-roman-baths',
      name: 'Римски терми',
      category: 'historical',
      shortDescription:
        'Едни от най-големите антични бани на Балканите — център на древния Одесос.',
      location: 'Варна',
      image: u('photo-1566073771259-6a8506099945'),
      coords: { lat: 43.201, lng: 27.9106 },
      mapsUrl: 'https://maps.google.com/?q=Roman+Thermae+Varna',
    },
    {
      id: 'dest-arch-museum-varna',
      name: 'Археологически музей Варна',
      category: 'museum',
      shortDescription:
        'Варненското златно съкровище и експозиции за тракийското и римското присъствие.',
      location: 'Варна',
      image: u('photo-1568667256549-088060a992c9'),
      coords: { lat: 43.2069, lng: 27.9103 },
      mapsUrl: 'https://maps.google.com/?q=Varna+Archaeological+Museum',
    },
    {
      id: 'dest-pobiti-kamani',
      name: 'Побити камъни',
      category: 'natural',
      shortDescription:
        'Природен феномен от каменни колони в степен ландшафт — уникална геоложка атракция.',
      location: 'Сливенски пясъци (Варненско)',
      image: u('photo-1470071459604-3b5ec3a7fe05'),
      coords: { lat: 43.2333, lng: 27.7167 },
      mapsUrl: 'https://maps.google.com/?q=Pobiti+Kamani',
    },
    {
      id: 'dest-varna-cathedral',
      name: 'Катедрален храм „Успение Богородично“',
      category: 'monument',
      shortDescription:
        'Един от най-разпознаваемите символи на Варна с богато изписан интериор и силно присъствие в центъра на града.',
      location: 'Варна',
      image: wiki('Varna Cathedral - 2.jpg'),
      coords: { lat: 43.204744, lng: 27.909394 },
      mapsUrl: 'https://maps.google.com/?q=Varna+Cathedral',
    },
    {
      id: 'dest-euxinograd',
      name: 'Дворец „Евксиноград“',
      category: 'historical',
      shortDescription:
        'Крайморска царска резиденция с парк, архитектурни детайли и гледки към северното Черноморие.',
      location: 'край Варна',
      image: wiki('Euxinograd Palace - view 1.jpg'),
      coords: { lat: 43.2283, lng: 28.0105 },
      mapsUrl: 'https://maps.google.com/?q=Euxinograd+Palace',
    },
  ],
  burgas: [
    {
      id: 'dest-nessebar',
      name: 'Несебър — архитектурен резерват',
      category: 'historical',
      shortDescription:
        'Средновековни църкви и тесни улички на полуостров — обект на ЮНЕСКО.',
      location: 'Несебър',
      image: u('photo-1523906834658-6e24ef2386f9'),
      coords: { lat: 42.6584, lng: 27.7366 },
      mapsUrl: 'https://maps.google.com/?q=Nesebar+Old+Town',
    },
    {
      id: 'dest-strandzha',
      name: 'Природен парк „Странджа“',
      category: 'eco_trail',
      shortDescription:
        'Девствени гори, тракийски култове и маршрути за наблюдение на птици и пеперуди.',
      location: 'Странджа',
      image: u('photo-1441974231531-c6227db76b6e'),
      coords: { lat: 42.0833, lng: 27.6167 },
      mapsUrl: 'https://maps.google.com/?q=Strandzha+Nature+Park',
    },
    {
      id: 'dest-ropotamo',
      name: 'Резерват „Ропотамо“',
      category: 'natural',
      shortDescription:
        'Речна джунгла с водни лилии и лодки — контраст с морския хоризонт наблизо.',
      location: 'Ропотамо',
      image: u('photo-1473448912368-24bc0c0fd258'),
      coords: { lat: 42.3333, lng: 27.75 },
      mapsUrl: 'https://maps.google.com/?q=Ropotamo+Reserve',
    },
    {
      id: 'dest-sozopol',
      name: 'Созопол',
      category: 'resort',
      shortDescription:
        'Дървени къщи над скали, галерии и фестивали — арт дух на южното крайбрежие.',
      location: 'Созопол',
      image: u('photo-1500375592092-40eb2168fd21'),
      coords: { lat: 42.4189, lng: 27.6964 },
      mapsUrl: 'https://maps.google.com/?q=Sozopol',
    },
    {
      id: 'dest-burgas-lakes',
      name: 'Комплекс Бургаски езера',
      category: 'reservoir_lake_view',
      shortDescription:
        'Влажни зони с розово фламинго и птичи наблюдения — природа до града.',
      location: 'Бургас',
      image: u('photo-1439066615861-d1af74d74000'),
      coords: { lat: 42.45, lng: 27.45 },
      mapsUrl: 'https://maps.google.com/?q=Burgas+Lakes',
    },
    {
      id: 'dest-beglik-tash',
      name: 'Тракийско светилище Бегликташ',
      category: 'historical',
      shortDescription:
        'Мегалитен култов комплекс в горите над Приморско, близо до резерват Ропотамо и южното море.',
      location: 'Приморско',
      image: wiki('Beglik Tash 045.jpg'),
      coords: { lat: 42.3092, lng: 27.7339 },
      mapsUrl: 'https://maps.google.com/?q=Beglik+Tash',
    },
    {
      id: 'dest-aquae-calidae',
      name: 'Акве Калиде',
      category: 'historical',
      shortDescription:
        'Археологически комплекс с древни минерални бани и възстановена баня на Сюлейман Великолепни край Бургас.',
      location: 'кв. Ветрен, Бургас',
      image: wiki('Aquae Calidae.jpg'),
      coords: { lat: 42.61149, lng: 27.39381 },
      mapsUrl: 'https://maps.google.com/?q=Aquae+Calidae+Burgas',
    },
    {
      id: 'dest-poda-burgas',
      name: 'Защитена местност „Пода“',
      category: 'natural',
      shortDescription:
        'Една от най-интересните орнитологични точки по Черноморието с наблюдателни площадки и богато птиче разнообразие.',
      location: 'край Бургас',
      image: u('photo-1439066615861-d1af74d74000'),
      coords: { lat: 42.4597, lng: 27.4736 },
      mapsUrl: 'https://maps.google.com/?q=Poda+Protected+Area',
    },
    {
      id: 'dest-sinemorets',
      name: 'Синеморец и устието на Велека',
      category: 'natural',
      shortDescription:
        'Дюни, морски панорами и едно от най-красивите устия в България — чудесно място за южно лятно бягство.',
      location: 'Синеморец',
      image: u('photo-1507525428034-b723cf961d3e'),
      coords: { lat: 42.0618, lng: 27.9789 },
      mapsUrl: 'https://maps.google.com/?q=Sinemorets+Veleka',
    },
  ],
  'veliko-tarnovo': [
    {
      id: 'dest-tsarevets',
      name: 'Крепост „Царевец“',
      category: 'historical',
      shortDescription:
        'Средновековна крепост с патриаршеска църква и вечерни аудиовизуални спектакли.',
      location: 'Велико Търново',
      image: u('photo-1464822759023-fed622ff2c3b'),
      coords: { lat: 43.0833, lng: 25.65 },
      mapsUrl: 'https://maps.google.com/?q=Tsarevets+Fortress',
    },
    {
      id: 'dest-arbanasi',
      name: 'Арбанаси',
      category: 'historical',
      shortDescription:
        'Архитектурен резерват с къщи-музеи и църкви с уникални стенописи.',
      location: 'Арбанаси',
      image: wiki('Arbanasi. Bulgaria.jpg'),
      coords: { lat: 43.098, lng: 25.668 },
      mapsUrl: 'https://maps.google.com/?q=Arbanasi+Bulgaria',
    },
    {
      id: 'dest-preobrazhenski',
      name: 'Преображенски манастир',
      category: 'monastery',
      shortDescription:
        'Голям манастирски ансамбъл с панорама към Търново и спокойни горски пътеки.',
      location: 'Велико Търново',
      image: u('photo-1549880338-65ddcdfd017b'),
      coords: { lat: 43.1167, lng: 25.6667 },
      mapsUrl: 'https://maps.google.com/?q=Transfiguration+Monastery+Veliko+Tarnovo',
    },
    {
      id: 'dest-emen-canyon',
      name: 'Еменски пролом',
      category: 'waterfall',
      shortDescription:
        'Ждрело с екопътека и малък водопад — освежаваща разходка през топлите месеци.',
      location: 'Емен',
      image: u('photo-1432405972618-c60b0225b8f9'),
      coords: { lat: 43.25, lng: 25.5167 },
      mapsUrl: 'https://maps.google.com/?q=Emen+Canyon',
    },
    {
      id: 'dest-hotnitsa-waterfall',
      name: 'Хотнишки водопад „Кая Бунар“',
      category: 'waterfall',
      shortDescription:
        'Къса, но много ефектна екопътека с тюркоазен водопад край село Хотница, близо до Велико Търново.',
      location: 'Хотница',
      image: wiki('Hotnitsa Bulgaria.JPG'),
      coords: { lat: 43.144, lng: 25.558 },
      mapsUrl: 'https://maps.google.com/?q=Hotnitsa+waterfall',
    },
  ],
  smolyan: [
    {
      id: 'dest-devil-throat',
      name: 'Пещерата „Дяволското гърло“',
      category: 'cave',
      shortDescription:
        'Впечатляваща пещера с подземна река Триградска — организирани обиколки и легенди.',
      location: 'Триград',
      image: u('photo-1509316785289-025f5b846b35'),
      coords: { lat: 41.6167, lng: 24.3833 },
      mapsUrl: 'https://maps.google.com/?q=Devil%27s+Throat+Cave',
    },
    {
      id: 'dest-shiroka-laka',
      name: 'Широка лъка',
      category: 'historical',
      shortDescription:
        'Архитектурен резерват с родопски къщи и фестивал на народните оркестри.',
      location: 'Широка лъка',
      image: u('photo-1465146344425-f00d5f5c8f07'),
      coords: { lat: 41.6833, lng: 24.5833 },
      mapsUrl: 'https://maps.google.com/?q=Shiroka+Laka',
    },
    {
      id: 'dest-orpheus-peaks',
      name: 'Орфееви скали',
      category: 'natural',
      shortDescription:
        'Скални форми и панорами към Родопите — леки маршрути за залез и снимки.',
      location: 'Чепинци / Смолян',
      image: u('photo-1469474968028-56623f02e42e'),
      coords: { lat: 41.5833, lng: 24.7 },
      mapsUrl: 'https://maps.google.com/?q=Orpheus+Cliffs+Smolyan',
    },
    {
      id: 'dest-dospat',
      name: 'Язовир „Доспат“',
      category: 'reservoir_lake_view',
      shortDescription:
        'Огледални води и риболов — типичен родопски пейзаж с пътеки по брега.',
      location: 'Доспат',
      image: u('photo-1439066615861-d1af74d74000'),
      coords: { lat: 41.65, lng: 24.1333 },
      mapsUrl: 'https://maps.google.com/?q=Dospat+Dam',
    },
    {
      id: 'dest-pamporovo',
      name: 'Пампорово',
      category: 'resort',
      shortDescription:
        'Ски и сноуборд през зимата, планинско колоездене и хайкинг през лятото.',
      location: 'Пампорово',
      image: u('photo-1551524164-687a55dd1126'),
      coords: { lat: 41.6564, lng: 24.6953 },
      mapsUrl: 'https://maps.google.com/?q=Pamporovo',
    },
    {
      id: 'dest-wonderful-bridges',
      name: 'Чудните мостове',
      category: 'natural',
      shortDescription:
        'Скални арки в Западните Родопи, оформени от ерозията на река Еркюприя, с кратки пешеходни маршрути.',
      location: 'Забърдо',
      image: u('photo-1469474968028-56623f02e42e'),
      coords: { lat: 41.818, lng: 24.582 },
      mapsUrl: 'https://maps.google.com/?q=Wonderful+Bridges+Bulgaria',
    },
    {
      id: 'dest-yagodinska-cave',
      name: 'Ягодинска пещера',
      category: 'cave',
      shortDescription:
        'Една от най-дългите и впечатляващи пещери в Родопите с добре оформен туристически маршрут и красиви зали.',
      location: 'Ягодина',
      image: u('photo-1509316785289-025f5b846b35'),
      coords: { lat: 41.6458, lng: 24.3331 },
      mapsUrl: 'https://maps.google.com/?q=Yagodina+Cave',
    },
    {
      id: 'dest-smolyan-lakes',
      name: 'Смолянските езера',
      category: 'reservoir_lake_view',
      shortDescription:
        'Горски маршрут с езера, панорамни гледки и усещане за тишина само на минути от града.',
      location: 'Смолян',
      image: u('photo-1439066615861-d1af74d74000'),
      coords: { lat: 41.5777, lng: 24.7071 },
      mapsUrl: 'https://maps.google.com/?q=Smolyan+Lakes',
    },
  ],
  gabrovo: [
    {
      id: 'dest-etar',
      name: 'Архитектурно-етнографски комплекс „Етър“',
      category: 'museum',
      shortDescription:
        'Жив музей на занаятите с водени колела и автентична атмосфера от XIX век.',
      location: 'Габрово',
      image: u('photo-1578662996442-48f60103fc96'),
      coords: { lat: 42.85, lng: 25.3167 },
      mapsUrl: 'https://maps.google.com/?q=Etar+Open-Air+Ethnographic+Museum',
    },
    {
      id: 'dest-bozhentsi',
      name: 'Боженци',
      category: 'historical',
      shortDescription:
        'Архитектурен резерват с каменни къщи и тихи улички — идеален уикенд маршрут.',
      location: 'Боженци',
      image: u('photo-1519904981063-b0cf448d479e'),
      coords: { lat: 42.9167, lng: 25.4 },
      mapsUrl: 'https://maps.google.com/?q=Bozhentsi',
    },
    {
      id: 'dest-shipka',
      name: 'Паметник на свободата (Шипка)',
      category: 'monument',
      shortDescription:
        'Символ на Руско-турската освободителна война с панорама към Балкана.',
      location: 'Шипка',
      image: u('photo-1464822759023-fed622ff2c3b'),
      coords: { lat: 42.75, lng: 25.3167 },
      mapsUrl: 'https://maps.google.com/?q=Shipka+Monument',
    },
    {
      id: 'dest-usha-waterfall',
      name: 'Местността „Узана“',
      category: 'eco_trail',
      shortDescription:
        'Планински ливади и пътеки — изходна точка за преходи в Централна Стара планина.',
      location: 'Узана',
      image: u('photo-1432405972618-c60b0225b8f9'),
      coords: { lat: 42.7667, lng: 25.2333 },
      mapsUrl: 'https://maps.google.com/?q=Uzana+Bulgaria',
    },
    {
      id: 'dest-tryavna',
      name: 'Трявна',
      category: 'historical',
      shortDescription:
        'Град на резбарската школа, часовниковата кула и възрожденските улици в полите на Стара планина.',
      location: 'Трявна',
      image: wiki('Tryavna, Bulgaria - panoramio.jpg'),
      coords: { lat: 42.8667, lng: 25.4919 },
      mapsUrl: 'https://maps.google.com/?q=Tryavna+Bulgaria',
    },
    {
      id: 'dest-dryanovo-monastery',
      name: 'Дряновски манастир',
      category: 'monastery',
      shortDescription:
        'Манастирски комплекс в живописно ждрело, свързан с историята на Априлското въстание и чудесни разходки в района.',
      location: 'Дряново',
      image: u('photo-1547036967-23d11aaca342'),
      coords: { lat: 42.9445, lng: 25.4748 },
      mapsUrl: 'https://maps.google.com/?q=Dryanovo+Monastery',
    },
  ],
  ruse: [
    {
      id: 'dest-ruse-center',
      name: 'Дунавска архитектурна разходка',
      category: 'historical',
      shortDescription:
        'Сецесионни фасади и площади край Дунава — наричана „малката Виена“ заради елегантния си силует.',
      location: 'Русе',
      image: u('photo-1523906834658-6e24ef2386f9'),
      coords: { lat: 43.8481, lng: 25.9544 },
      mapsUrl: 'https://maps.google.com/?q=Ruse+Bulgaria',
    },
    {
      id: 'dest-basarbovo',
      name: 'Басарбовски скален манастир',
      category: 'monastery',
      shortDescription:
        'Скален манастир над Русенски Лом с пътеки и гледка към дефилето.',
      location: 'Басарбово',
      image: u('photo-1547036967-23d11aaca342'),
      coords: { lat: 43.8167, lng: 25.9833 },
      mapsUrl: 'https://maps.google.com/?q=Basarbovo+Rock+Monastery',
    },
    {
      id: 'dest-ivanovo',
      name: 'Скални църкви Иваново',
      category: 'historical',
      shortDescription:
        'ЮНЕСКО обект със средновековни стенописи в скални ниши над Русенски Лом.',
      location: 'Иваново',
      image: u('photo-1516483638261-f4dbaf036963'),
      coords: { lat: 43.7, lng: 25.85 },
      mapsUrl: 'https://maps.google.com/?q=Rock-Hewn+Churches+of+Ivanovo',
    },
    {
      id: 'dest-danube-park',
      name: 'Дунавски парк и кей',
      category: 'natural',
      shortDescription:
        'Алеи край реката с гледка към румънския бряг — любимо място за залез.',
      location: 'Русе',
      image: u('photo-1505765050516-f72dcac9c60e'),
      coords: { lat: 43.85, lng: 25.97 },
      mapsUrl: 'https://maps.google.com/?q=Ruse+Danube+Park',
    },
    {
      id: 'dest-orlova-chuka',
      name: 'Пещера „Орлова чука“',
      category: 'cave',
      shortDescription:
        'Една от най-дългите пещери в България, разположена в Русенски Лом, с просторни галерии и подземни форми.',
      location: 'Две могили',
      image: wiki('Orlova Chuka Cave 3.jpg'),
      coords: { lat: 43.5899, lng: 25.9603 },
      mapsUrl: 'https://maps.google.com/?q=Orlova+Chuka+Cave',
    },
    {
      id: 'dest-rusenski-lom',
      name: 'Природен парк „Русенски Лом“',
      category: 'eco_trail',
      shortDescription:
        'Каньонни гледки, скални манастири и приятни екомаршрути в една от най-живописните дунавски местности.',
      location: 'Русенско',
      image: u('photo-1472214103451-9374bd1c798e'),
      coords: { lat: 43.6962, lng: 25.9537 },
      mapsUrl: 'https://maps.google.com/?q=Rusenski+Lom+Nature+Park',
    },
  ],
  'stara-zagora': [
    {
      id: 'dest-starosel',
      name: 'Тракийски храмов комплекс Старосел',
      category: 'historical',
      shortDescription:
        'Уникална тракийска гробница с колонада — комбинира се с винени дегустации в района.',
      location: 'Старосел',
      image: u('photo-1566073771259-6a8506099945'),
      coords: { lat: 42.4833, lng: 24.5333 },
      mapsUrl: 'https://maps.google.com/?q=Starosel+Thracian+Temple',
    },
    {
      id: 'dest-neolithic',
      name: 'Неолитни жилища',
      category: 'museum',
      shortDescription:
        'Музей на открито с реконструкции от каменно-медната епоха в центъра на града.',
      location: 'Стара Загора',
      image: u('photo-1568667256549-088060a992c9'),
      coords: { lat: 42.425, lng: 25.6417 },
      mapsUrl: 'https://maps.google.com/?q=Stara+Zagora+Neolithic+Dwellings',
    },
    {
      id: 'dest-bedechka',
      name: 'Парк „Бедечка“',
      category: 'eco_trail',
      shortDescription:
        'Градски парк с алеи край реката — зелена пауза между музеите.',
      location: 'Стара Загора',
      image: u('photo-1441974231531-c6227db76b6e'),
      coords: { lat: 42.42, lng: 25.64 },
      mapsUrl: 'https://maps.google.com/?q=Bedechka+Park',
    },
    {
      id: 'dest-zagorka',
      name: 'Винени маршрути в региона',
      category: 'resort',
      shortDescription:
        'Дегустации в изби и комбинация с тракийското наследство наоколо.',
      location: 'Старозагорско',
      image: u('photo-1510812431401-41d2bd2722f3'),
      coords: { lat: 42.45, lng: 25.6 },
      mapsUrl: 'https://maps.google.com/?q=Stara+Zagora+wineries',
    },
  ],
  vidin: [
    {
      id: 'dest-baba-vida',
      name: 'Крепост „Баба Вида“',
      category: 'historical',
      shortDescription:
        'Най-добре запазената средновековна крепост в България — на брега на Дунава във Видин.',
      location: 'Видин',
      image: u('photo-1523906834658-6e24ef2386f9'),
      coords: { lat: 43.9897, lng: 22.8825 },
      mapsUrl: 'https://maps.google.com/?q=Baba+Vida+Fortress',
    },
    {
      id: 'dest-belogradchik',
      name: 'Белоградчишки скали',
      category: 'natural',
      shortDescription:
        'Червеникави скални форми и крепост „Калето“ — една от емблемите на Северозапада.',
      location: 'Белоградчик',
      image: wiki('Belogradchik rocks 2009.jpg'),
      coords: { lat: 43.6236, lng: 22.685 },
      mapsUrl: 'https://maps.google.com/?q=Belogradchik+Rocks',
    },
    {
      id: 'dest-magura',
      name: 'Магура пещера',
      category: 'cave',
      shortDescription:
        'Пещера с праисторически рисунки и подземни зали — природна и културна стойност.',
      location: 'Рабиша',
      image: u('photo-1509316785289-025f5b846b35'),
      coords: { lat: 43.728, lng: 22.582 },
      mapsUrl: 'https://maps.google.com/?q=Magura+Cave+Bulgaria',
    },
  ],
  vratsa: [
    {
      id: 'dest-ledenika',
      name: 'Леденика пещера',
      category: 'cave',
      shortDescription:
        'Ледени сталактити и подземни зали във Врачанския Балкан — класическа екскурзия.',
      location: 'Враца',
      image: u('photo-1509316785289-025f5b846b35'),
      coords: { lat: 43.2, lng: 23.58 },
      mapsUrl: 'https://maps.google.com/?q=Ledenika+Cave',
    },
    {
      id: 'dest-vratsa-balkan',
      name: 'Природен парк „Врачански Балкан“',
      category: 'eco_trail',
      shortDescription:
        'Скали, орли и маркирани маршрути — любимо място за катерачи и туристи.',
      location: 'Враца',
      image: u('photo-1464822759023-fed622ff2c3b'),
      coords: { lat: 43.15, lng: 23.55 },
      mapsUrl: 'https://maps.google.com/?q=Vrachanski+Balkan+Nature+Park',
    },
    {
      id: 'dest-okolchitsa',
      name: 'Връх Околчица',
      category: 'monument',
      shortDescription:
        'Паметник на загиналите под връх Околчица — история и панорама към Балкана.',
      location: 'Врачански Балкан',
      image: u('photo-1469474968028-56623f02e42e'),
      coords: { lat: 43.15, lng: 23.67 },
      mapsUrl: 'https://maps.google.com/?q=Okolchitsa',
    },
  ],
  montana: [
    {
      id: 'dest-chiprovtsi',
      name: 'Чипровци',
      category: 'historical',
      shortDescription:
        'Известен с килимарството си град с възрожденска архитектура и музей на килима.',
      location: 'Чипровци',
      image: u('photo-1578662996442-48f60103fc96'),
      coords: { lat: 43.384, lng: 23.117 },
      mapsUrl: 'https://maps.google.com/?q=Chiprovtsi',
    },
    {
      id: 'dest-lopushanski',
      name: 'Лопушански манастир',
      category: 'monastery',
      shortDescription:
        'Живописен манастир в дъбова гора — спокойствие и дърворезба в църквата.',
      location: 'Монтана',
      image: u('photo-1549880338-65ddcdfd017b'),
      coords: { lat: 43.52, lng: 23.52 },
      mapsUrl: 'https://maps.google.com/?q=Lopushanski+Monastery',
    },
  ],
  pleven: [
    {
      id: 'dest-pleven-panorama',
      name: 'Панорама „Плевенска епопея 1877 г.“',
      category: 'museum',
      shortDescription:
        'Диорама и експозиции за обсадата на Плевен — впечатляваща историческа атракция.',
      location: 'Плевен',
      image: u('photo-1566073771259-6a8506099945'),
      coords: { lat: 43.417, lng: 24.608 },
      mapsUrl: 'https://maps.google.com/?q=Pleven+Panorama',
    },
    {
      id: 'dest-kaylaka',
      name: 'Парк „Кайлъка“',
      category: 'natural',
      shortDescription:
        'Каньон с езеро, алеи и скали — зелена зона за разходка в града.',
      location: 'Плевен',
      image: u('photo-1441974231531-c6227db76b6e'),
      coords: { lat: 43.395, lng: 24.595 },
      mapsUrl: 'https://maps.google.com/?q=Kaylaka+Park+Pleven',
    },
  ],
  lovech: [
    {
      id: 'dest-lovech-bridge',
      name: 'Покритият мост на Колю Фичето',
      category: 'monument',
      shortDescription:
        'Единственият покрит мост в България от епохата на Възраждането — символ на Ловеч.',
      location: 'Ловеч',
      image: u('photo-1559827260-dc66d52bef19'),
      coords: { lat: 42.845, lng: 24.747 },
      mapsUrl: 'https://maps.google.com/?q=Covered+Bridge+Lovech',
    },
    {
      id: 'dest-devetashka',
      name: 'Деветашка пещера',
      category: 'cave',
      shortDescription:
        'Гигантска пещерна зала с „прозорци“ към небето — дом на прилепи и фотогенични гледки.',
      location: 'Деветаки',
      image: u('photo-1509316785289-025f5b846b35'),
      coords: { lat: 43.241, lng: 24.872 },
      mapsUrl: 'https://maps.google.com/?q=Devetashka+cave',
    },
    {
      id: 'dest-prohodna-cave',
      name: 'Пещера „Проходна“',
      category: 'cave',
      shortDescription:
        'Карстова пещера край Карлуково, известна с „Очите на Бога“ и огромните си естествени отвори в свода.',
      location: 'Карлуково',
      image: wiki('Prohodna Cave.jpg'),
      coords: { lat: 43.1777, lng: 24.0769 },
      mapsUrl: 'https://maps.google.com/?q=Prohodna+Cave',
    },
    {
      id: 'dest-krushuna-waterfalls',
      name: 'Крушунски водопади',
      category: 'waterfall',
      shortDescription:
        'Каскада от варовикови тераси, тюркоазени води и кратки пътеки в Деветашкото плато.',
      location: 'Крушуна',
      image: wiki('Cascade-Krushuna - panoramio.jpg'),
      coords: { lat: 43.2431, lng: 25.0333 },
      mapsUrl: 'https://maps.google.com/?q=Krushuna+waterfalls',
    },
    {
      id: 'dest-lovech-fortress',
      name: 'Крепост „Хисаря“',
      category: 'historical',
      shortDescription:
        'Средновековна крепост над Ловеч с панорама към града, реката и възрожденския силует наоколо.',
      location: 'Ловеч',
      image: u('photo-1464822759023-fed622ff2c3b'),
      coords: { lat: 42.8518, lng: 24.7184 },
      mapsUrl: 'https://maps.google.com/?q=Hisarya+Fortress+Lovech',
    },
    {
      id: 'dest-saeva-dupka',
      name: 'Пещера „Съева дупка“',
      category: 'cave',
      shortDescription:
        'Известна с впечатляващи зали, добър туристически маршрут и отлична акустика сред варовиковите масиви на Предбалкана.',
      location: 'Брестница',
      image: u('photo-1509316785289-025f5b846b35'),
      coords: { lat: 43.1033, lng: 24.1741 },
      mapsUrl: 'https://maps.google.com/?q=Saeva+Dupka',
    },
  ],
  dobrich: [
    {
      id: 'dest-balchik',
      name: 'Дворецът в Балчик',
      category: 'historical',
      shortDescription:
        'Ботаническа градина и архитектурен комплекс на румънската кралица Мария край морето.',
      location: 'Балчик',
      image: u('photo-1437719417032-8595fd9e9dc6'),
      coords: { lat: 43.417, lng: 28.165 },
      mapsUrl: 'https://maps.google.com/?q=Balchik+Palace',
    },
    {
      id: 'dest-kaliakra',
      name: 'Нос Калиакра',
      category: 'natural',
      shortDescription:
        'Високи скали над морето с останки от крепост — залези и наблюдение на птици.',
      location: 'Каварна',
      image: u('photo-1507525428034-b723cf961d3e'),
      coords: { lat: 43.36, lng: 28.46 },
      mapsUrl: 'https://maps.google.com/?q=Cape+Kaliakra',
    },
  ],
  shumen: [
    {
      id: 'dest-madara',
      name: 'Мадарски конник',
      category: 'historical',
      shortDescription:
        'Скален релеф от ранното Средновековие — обект на ЮНЕСКО над село Мадара.',
      location: 'Мадара',
      image: u('photo-1523906834658-6e24ef2386f9'),
      coords: { lat: 43.275, lng: 27.118 },
      mapsUrl: 'https://maps.google.com/?q=Madara+Rider',
    },
    {
      id: 'dest-pliska',
      name: 'Национален историко-археологически резерват „Плиска“',
      category: 'museum',
      shortDescription:
        'Първата столица на България — основи на голямата базилика и музей на открито.',
      location: 'Плиска',
      image: u('photo-1568667256549-088060a992c9'),
      coords: { lat: 43.365, lng: 27.247 },
      mapsUrl: 'https://maps.google.com/?q=Pliska+Bulgaria',
    },
    {
      id: 'dest-preslav',
      name: 'Велики Преслав',
      category: 'historical',
      shortDescription:
        'Столица от Златния век с археологически музей и останки от крепостните стени.',
      location: 'Велики Преслав',
      image: u('photo-1566073771259-6a8506099945'),
      coords: { lat: 43.161, lng: 26.814 },
      mapsUrl: 'https://maps.google.com/?q=Veliki+Preslav',
    },
  ],
  silistra: [
    {
      id: 'dest-silistra-fort',
      name: 'Римска крепост Дуросторум',
      category: 'historical',
      shortDescription:
        'Антично наследство на Дунава — останки и музейна интерпретация на регионалната история.',
      location: 'Силистра',
      image: u('photo-1566073771259-6a8506099945'),
      coords: { lat: 44.117, lng: 27.265 },
      mapsUrl: 'https://maps.google.com/?q=Silistra+Roman+fort',
    },
    {
      id: 'dest-srebarna',
      name: 'Резерват „Сребърна“',
      category: 'natural',
      shortDescription:
        'ЮНЕСКО влажна зона с пеликани и къдроглави корморани — орнитологичен рай.',
      location: 'Сребърна',
      image: u('photo-1439066615861-d1af74d74000'),
      coords: { lat: 44.113, lng: 27.07 },
      mapsUrl: 'https://maps.google.com/?q=Srebarna+Nature+Reserve',
    },
  ],
  sliven: [
    {
      id: 'dest-blue-rocks',
      name: 'Природен феномен „Сините камъни“',
      category: 'natural',
      shortDescription:
        'Големи гранитни блокове сред гора — панорамни площадки и пътеки за разходка.',
      location: 'Сливен',
      image: u('photo-1464822759023-fed622ff2c3b'),
      coords: { lat: 42.65, lng: 26.35 },
      mapsUrl: 'https://maps.google.com/?q=Blue+Stones+Sliven',
    },
    {
      id: 'dest-karandila',
      name: 'Карандила',
      category: 'eco_trail',
      shortDescription:
        'Плато над Сливен с лифт, алеи и гледки към Стара планина.',
      location: 'Сливен',
      image: u('photo-1501785888041-af3ef285b470'),
      coords: { lat: 42.64, lng: 26.32 },
      mapsUrl: 'https://maps.google.com/?q=Karandila',
    },
  ],
  yambol: [
    {
      id: 'dest-kabile',
      name: 'Античен и средновековен град „Кабиле“',
      category: 'historical',
      shortDescription:
        'Археологически резерват с тракийски, римски и средновековни находки край Ямбол.',
      location: 'Ямбол',
      image: u('photo-1559827260-dc66d52bef19'),
      coords: { lat: 42.483, lng: 26.523 },
      mapsUrl: 'https://maps.google.com/?q=Kabile+Yambol',
    },
    {
      id: 'dest-tundzha',
      name: 'Долина на Тунджа',
      category: 'eco_trail',
      shortDescription:
        'Речни тераси и полски пейзажи — спокойни маршрути за колоездене и риболов.',
      location: 'Ямболско',
      image: u('photo-1473448912368-24bc0c0fd258'),
      coords: { lat: 42.45, lng: 26.5 },
      mapsUrl: 'https://maps.google.com/?q=Tundzha+river+Bulgaria',
    },
  ],
  haskovo: [
    {
      id: 'dest-aleksandrovo',
      name: 'Тракийска гробница при Александрово',
      category: 'historical',
      shortDescription:
        'Гробница с уникални стенописи на конници — важен паметник на тракийското изкуство.',
      location: 'Александрово',
      image: u('photo-1565008576549-57569a49371d'),
      coords: { lat: 41.98, lng: 25.3 },
      mapsUrl: 'https://maps.google.com/?q=Aleksandrovo+Thracian+tomb',
    },
    {
      id: 'dest-statue-monuments',
      name: 'Алея на възрожденците (Димитровград)',
      category: 'monument',
      shortDescription:
        'Парк с монументални скулптури на български възрожденци — необичайна туристическа точка.',
      location: 'Димитровград',
      image: u('photo-1526481280695-3c687fd643ed'),
      coords: { lat: 42.05, lng: 25.6 },
      mapsUrl: 'https://maps.google.com/?q=Dimitrovgrad+Bulgaria',
    },
  ],
  kardzhali: [
    {
      id: 'dest-perperikon',
      name: 'Перперикон',
      category: 'historical',
      shortDescription:
        'Скално тракийско светилище и средновековна крепост — археологически комплекс с панорама.',
      location: 'Кърджали',
      image: u('photo-1469474968028-56623f02e42e'),
      coords: { lat: 41.715, lng: 25.465 },
      mapsUrl: 'https://maps.google.com/?q=Perperikon',
    },
    {
      id: 'dest-stone-mushrooms',
      name: 'Каменните гъби',
      category: 'natural',
      shortDescription:
        'Вулканогенни скални форми при село Бели пласт — фотогеничен природен феномен.',
      location: 'Бели пласт',
      image: u('photo-1470071459604-3b5ec3a7fe05'),
      coords: { lat: 41.37, lng: 25.12 },
      mapsUrl: 'https://maps.google.com/?q=Stone+Mushrooms+Bulgaria',
    },
  ],
  kyustendil: [
    {
      id: 'dest-hisarlaka',
      name: 'Крепост „Хисарлъка“',
      category: 'historical',
      shortDescription:
        'Антична и средновековна крепост над Кюстендил с панорама към града и Осоговската планина.',
      location: 'Кюстендил',
      image: u('photo-1523906834658-6e24ef2386f9'),
      coords: { lat: 42.295, lng: 22.684 },
      mapsUrl: 'https://maps.google.com/?q=Hisarlaka+Kyustendil',
    },
    {
      id: 'dest-kyustendil-spa',
      name: 'Кюстендил — минерални извори',
      category: 'resort',
      shortDescription:
        'Град с дълги СПА традиции, черешови градини и близост до Осоговска планина.',
      location: 'Кюстендил',
      image: u('photo-1540555700478-4be289fbecef'),
      coords: { lat: 42.283, lng: 22.691 },
      mapsUrl: 'https://maps.google.com/?q=Kyustendil+spa',
    },
    {
      id: 'dest-seven-rila-lakes',
      name: 'Седемте рилски езера',
      category: 'natural',
      shortDescription:
        'Ледникови езера високо в Рила с класически панорамен маршрут над хижа „Рилски езера“.',
      location: 'Рила, над Паничище',
      image: wiki('View from Seven Rila Lakes.jpg'),
      coords: { lat: 42.2046, lng: 23.3206 },
      mapsUrl: 'https://maps.google.com/?q=Seven+Rila+Lakes',
    },
  ],
  pazardzhik: [
    {
      id: 'dest-batak',
      name: 'Исторически музей Батак',
      category: 'museum',
      shortDescription:
        'Памет на Априлското въстание — силна историческа експозиция в Родопския град Батак.',
      location: 'Батак',
      image: u('photo-1568667256549-088060a992c9'),
      coords: { lat: 41.942, lng: 24.217 },
      mapsUrl: 'https://maps.google.com/?q=Batak+museum',
    },
    {
      id: 'dest-velingrad',
      name: 'Велинград — СПА столица',
      category: 'resort',
      shortDescription:
        'Минерални басейни и хотели сред борова гора — класическа СПА дестинация.',
      location: 'Велинград',
      image: u('photo-1540555700478-4be289fbecef'),
      coords: { lat: 42.027, lng: 23.995 },
      mapsUrl: 'https://maps.google.com/?q=Velingrad',
    },
  ],
  pernik: [
    {
      id: 'dest-surva',
      name: 'Международен фестивал Сурва',
      category: 'historical',
      shortDescription:
        'Перник е домакин на маскарадния празник с кукерски групи от цяла България и света.',
      location: 'Перник',
      image: u('photo-1578662996442-48f60103fc96'),
      coords: { lat: 42.605, lng: 23.031 },
      mapsUrl: 'https://maps.google.com/?q=Pernik+Surva',
    },
    {
      id: 'dest-ruen-pernik',
      name: 'Връх Руен (Осогово)',
      category: 'natural',
      shortDescription:
        'Най-високият връх на Осоговската планина — гранични гледки и алпийски пастири.',
      location: 'Перник / Кюстендил',
      image: u('photo-1486879141951-b511622f4d8e'),
      coords: { lat: 42.159, lng: 22.536 },
      mapsUrl: 'https://maps.google.com/?q=Ruen+peak+Osogovo',
    },
  ],
  razgrad: [
    {
      id: 'dest-sveshtari',
      name: 'Тракийска гробница при Свещари',
      category: 'historical',
      shortDescription:
        'ЮНЕСКО паметник с уникални архитектурни орнаменти — една от най-значимите тракийски гробници в света (община Исперих).',
      location: 'Свещари',
      image: u('photo-1565008576549-57569a49371d'),
      coords: { lat: 43.667, lng: 26.25 },
      mapsUrl: 'https://maps.google.com/?q=Sveshtari+Thracian+tomb',
    },
    {
      id: 'dest-ludogorie',
      name: 'Лудогорие — природни маршрути',
      category: 'eco_trail',
      shortDescription:
        'Хълмиста равнина с гори и села — спокойни пътеки и орнитология.',
      location: 'Разградско',
      image: u('photo-1441974231531-c6227db76b6e'),
      coords: { lat: 43.55, lng: 26.5 },
      mapsUrl: 'https://maps.google.com/?q=Ludogorie',
    },
  ],
  targovishte: [
    {
      id: 'dest-museum-tg',
      name: 'Регионален исторически музей Търговище',
      category: 'museum',
      shortDescription:
        'Експозиции за траките, средновековието и етнографията на Североизточна България.',
      location: 'Търговище',
      image: u('photo-1568667256549-088060a992c9'),
      coords: { lat: 43.25, lng: 26.567 },
      mapsUrl: 'https://maps.google.com/?q=Targovishte+museum',
    },
    {
      id: 'dest-prescribed-nature',
      name: 'Природни паркове в околността',
      category: 'natural',
      shortDescription:
        'Комбинирайте града с разходки към Преслав, Омуртаговските езера и лозовите масиви.',
      location: 'Търговище',
      image: u('photo-1506905925346-21bda4d32df4'),
      coords: { lat: 43.24, lng: 26.58 },
      mapsUrl: 'https://maps.google.com/?q=Targovishte+nature',
    },
  ],
}

const WIKI_SEARCH_PREFIX = 'wiki-search:'

const isUnsplashImage = (url?: string) =>
  Boolean(url && url.includes('images.unsplash.com/'))

const searchToken = (query: string) => `${WIKI_SEARCH_PREFIX}${query.trim()}`

const mapsQuery = (mapsUrl?: string) => {
  if (!mapsUrl) return ''

  try {
    const parsed = new URL(mapsUrl)
    return decodeURIComponent(parsed.searchParams.get('q') ?? '').replace(/\+/g, ' ')
  } catch {
    return ''
  }
}

const DESTINATION_IMAGE_SEARCH_QUERY: Record<string, string> = {
  'dest-aleksander-nevski': 'Alexander Nevsky Cathedral Sofia',
  'dest-boyana-church': 'Boyana Church Sofia',
  'dest-nhm': 'National History Museum Sofia',
  'dest-archaeological-sofia': 'National Archaeological Museum Sofia',
  'dest-vitosha': 'Vitosha Nature Park Bulgaria',
  'dest-iskar-gorge': 'Iskar Gorge Bulgaria',
  'dest-kokalyane': 'Kokalyane Monastery Bulgaria',
  'dest-vihren': 'Vihren Peak Bulgaria',
  'dest-banderitsa': 'Banderitsa Hut Pirin',
  'dest-rozhen': 'Rozhen Monastery Bulgaria',
  'dest-bansko': 'Bansko Bulgaria',
  'dest-rila-monastery-bg': 'Rila Monastery Bulgaria',
  'dest-plovdiv-old': 'Ancient Theatre Plovdiv',
  'dest-bachkovo': 'Bachkovo Monastery Bulgaria',
  'dest-asen-fortress': "Asen's Fortress Bulgaria",
  'dest-museum-plovdiv': 'Plovdiv Ethnographic Museum',
  'dest-narechen': 'Narechenski Bani Bulgaria',
  'dest-varna-sea': 'Sea Garden Varna',
  'dest-aladja': 'Aladzha Monastery Bulgaria',
  'dest-roman-baths': 'Roman Baths Varna',
  'dest-arch-museum-varna': 'Varna Archaeological Museum',
  'dest-pobiti-kamani': 'Pobiti Kamani Bulgaria',
  'dest-nessebar': 'Nessebar Old Town Bulgaria',
  'dest-strandzha': 'Strandzha Nature Park Bulgaria',
  'dest-ropotamo': 'Ropotamo Reserve Bulgaria',
  'dest-sozopol': 'Sozopol Bulgaria',
  'dest-burgas-lakes': 'Burgas Lakes Bulgaria',
  'dest-poda-burgas': 'Poda Protected Area Burgas',
  'dest-sinemorets': 'Sinemorets Veleka Bulgaria',
  'dest-tsarevets': 'Tsarevets Fortress Veliko Tarnovo',
  'dest-preobrazhenski': 'Preobrazhenski Monastery Bulgaria',
  'dest-emen-canyon': 'Emen Canyon Bulgaria',
  'dest-devil-throat': "Devil's Throat Cave Bulgaria",
  'dest-shiroka-laka': 'Shiroka Laka Bulgaria',
  'dest-orpheus-peaks': 'Orpheus Cliffs Smolyan',
  'dest-dospat': 'Dospat Dam Bulgaria',
  'dest-pamporovo': 'Pamporovo Bulgaria',
  'dest-wonderful-bridges': 'Wonderful Bridges Bulgaria',
  'dest-yagodinska-cave': 'Yagodina Cave Bulgaria',
  'dest-smolyan-lakes': 'Smolyan Lakes Bulgaria',
  'dest-etar': 'Etar Open Air Museum Bulgaria',
  'dest-bozhentsi': 'Bozhentsi Bulgaria',
  'dest-shipka': 'Shipka Monument Bulgaria',
  'dest-usha-waterfall': 'Uzana Bulgaria',
  'dest-dryanovo-monastery': 'Dryanovo Monastery Bulgaria',
  'dest-ruse-center': 'Ruse Bulgaria',
  'dest-basarbovo': 'Basarbovo Rock Monastery Bulgaria',
  'dest-ivanovo': 'Rock Hewn Churches of Ivanovo',
  'dest-danube-park': 'Danube Park Ruse',
  'dest-rusenski-lom': 'Rusenski Lom Nature Park',
  'dest-starosel': 'Starosel Thracian Temple Bulgaria',
  'dest-neolithic': 'Neolithic Dwellings Stara Zagora',
  'dest-bedechka': 'Bedechka Park Stara Zagora',
  'dest-zagorka': 'Stara Zagora Bulgaria',
  'dest-baba-vida': 'Baba Vida Fortress Bulgaria',
  'dest-magura': 'Magura Cave Bulgaria',
  'dest-ledenika': 'Ledenika Cave Bulgaria',
  'dest-vratsa-balkan': 'Vrachanski Balkan Nature Park',
  'dest-okolchitsa': 'Okolchitsa Bulgaria',
  'dest-chiprovtsi': 'Chiprovtsi Bulgaria',
  'dest-lopushanski': 'Lopushanski Monastery Bulgaria',
  'dest-pleven-panorama': 'Pleven Panorama Bulgaria',
  'dest-kaylaka': 'Kaylaka Park Pleven',
  'dest-lovech-bridge': 'Covered Bridge Lovech Bulgaria',
  'dest-devetashka': 'Devetashka Cave Bulgaria',
  'dest-lovech-fortress': 'Hisarya Fortress Lovech',
  'dest-saeva-dupka': 'Saeva Dupka Cave Bulgaria',
  'dest-balchik': 'Balchik Palace Bulgaria',
  'dest-kaliakra': 'Cape Kaliakra Bulgaria',
  'dest-madara': 'Madara Rider Bulgaria',
  'dest-pliska': 'Pliska Bulgaria',
  'dest-preslav': 'Veliki Preslav Bulgaria',
  'dest-silistra-fort': 'Durostorum Silistra Bulgaria',
  'dest-srebarna': 'Srebarna Nature Reserve Bulgaria',
  'dest-blue-rocks': 'Blue Stones Sliven Bulgaria',
  'dest-karandila': 'Karandila Bulgaria',
  'dest-kabile': 'Kabile Bulgaria',
  'dest-tundzha': 'Tundzha river Bulgaria',
  'dest-aleksandrovo': 'Aleksandrovo Thracian tomb Bulgaria',
  'dest-statue-monuments': 'Dimitrovgrad Bulgaria',
  'dest-perperikon': 'Perperikon Bulgaria',
  'dest-stone-mushrooms': 'Stone Mushrooms Bulgaria',
  'dest-hisarlaka': 'Hisarlaka Kyustendil Bulgaria',
  'dest-kyustendil-spa': 'Kyustendil Bulgaria',
  'dest-batak': 'Batak Bulgaria',
  'dest-velingrad': 'Velingrad Bulgaria',
  'dest-surva': 'Surva Pernik Bulgaria',
  'dest-ruen-pernik': 'Ruen peak Osogovo Bulgaria',
  'dest-sveshtari': 'Sveshtari Thracian tomb Bulgaria',
  'dest-ludogorie': 'Ludogorie Bulgaria',
  'dest-museum-tg': 'Targovishte Museum Bulgaria',
  'dest-prescribed-nature': 'Targovishte Bulgaria',
}

const hasReadableLatin = (value?: string) => /[A-Za-z]{3,}/.test(value ?? '')

const buildDestinationSearchQuery = (destination: Destination) => {
  const explicit = DESTINATION_IMAGE_SEARCH_QUERY[destination.id]
  if (explicit) return explicit

  const mapBased = mapsQuery(destination.mapsUrl)
  if (hasReadableLatin(mapBased)) return mapBased

  const fallbackParts = [destination.name, destination.location]
    .map((part) => part?.trim())
    .filter(Boolean)

  return fallbackParts.join(' ')
}

const withRealInternetImages = (destination: Destination): Destination => {
  const local = LOCAL_DESTINATION_IMAGES[destination.id]
  if (local) {
    return {
      ...destination,
      image: local.image,
      images: local.images,
    }
  }

  const query = searchToken(buildDestinationSearchQuery(destination))
  const replaceImage = (url: string) => (isUnsplashImage(url) ? query : url)

  return {
    ...destination,
    image: replaceImage(destination.image),
    images: destination.images?.map(replaceImage),
  }
}

export const DESTINATIONS_BY_SLUG: Record<string, Destination[]> = Object.fromEntries(
  Object.entries(RAW_DESTINATIONS_BY_SLUG).map(([slug, destinations]) => [
    slug,
    destinations.map(withRealInternetImages),
  ]),
)
