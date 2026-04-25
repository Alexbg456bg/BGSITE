import type { Destination } from '../types'

type DestinationImageOverride = Pick<Destination, 'image' | 'images'>

export const LOCAL_DESTINATION_IMAGES: Record<string, DestinationImageOverride> = {
  "dest-aleksander-nevski": {
    "image": "/images/destinations/dest-aleksander-nevski.jpg"
  },
  "dest-archaeological-sofia": {
    "image": "/images/destinations/dest-archaeological-sofia.jpg"
  },
  "dest-bedechka": {
    "image": "/images/destinations/dest-bedechka.jpg"
  },
  "dest-blue-rocks": {
    "image": "/images/destinations/dest-blue-rocks.svg"
  },
  "dest-boyana-church": {
    "image": "/images/destinations/dest-boyana-church.jpg"
  },
  "dest-burgas-lakes": {
    "image": "/images/destinations/dest-burgas-lakes.jpg"
  },
  "dest-devil-throat": {
    "image": "/images/destinations/dest-devil-throat.jpg"
  },
  "dest-kyustendil-spa": {
    "image": "/images/destinations/dest-kyustendil-spa.jpg"
  },
  "dest-neolithic": {
    "image": "/images/destinations/dest-neolithic.jpg"
  },
  "dest-pamporovo": {
    "image": "/images/destinations/dest-pamporovo.jpg"
  },
  "dest-poda-burgas": {
    "image": "/images/destinations/dest-poda-burgas.jpg"
  },
  "dest-red-church-perushtitsa": {
    "image": "/images/destinations/dest-red-church-perushtitsa.jpg"
  },
  "dest-roman-baths": {
    "image": "/images/destinations/dest-roman-baths.jpg"
  },
  "dest-rozhen": {
    "image": "/images/destinations/dest-rozhen.jpg"
  },
  "dest-ruse-center": {
    "image": "/images/destinations/dest-ruse-center.jpg"
  },
  "dest-sinemorets": {
    "image": "/images/destinations/dest-sinemorets.jpg"
  },
  "dest-srebarna": {
    "image": "/images/destinations/dest-srebarna.jpg"
  },
  "dest-strandzha": {
    "image": "/images/destinations/dest-strandzha.jpg"
  },
  "dest-varna-sea": {
    "image": "/images/destinations/dest-varna-sea.jpg"
  },
  "dest-vihren": {
    "image": "/images/destinations/dest-vihren.png"
  },
  "dest-vratsa-balkan": {
    "image": "/images/destinations/dest-vratsa-balkan.jpg"
  },
  "dest-zagorka": {
    "image": "/images/destinations/dest-zagorka.jpg"
  },
  "dest-nhm": {
    "image": "/images/destinations/dest-nhm.jpg"
  },
  "dest-vitosha": {
    "image": "/images/destinations/dest-vitosha.jpg"
  },
  "dest-kokalyane": {
    "image": "/images/destinations/dest-kokalyane.jpg"
  },
  "dest-koprivshtitsa": {
    "image": "/images/destinations/dest-koprivshtitsa.jpg"
  },
  "dest-melnik-pyramids": {
    "image": "/images/destinations/dest-melnik-pyramids.jpg"
  },
  "dest-asen-fortress": {
    "image": "/images/destinations/dest-asen-fortress.jpg"
  },
  "dest-narechen": {
    "image": "/images/destinations/dest-narechen.jpg"
  },
  "dest-hisarya-roman-thermae": {
    "image": "/images/destinations/dest-hisarya-roman-thermae.jpg"
  }
} as const
