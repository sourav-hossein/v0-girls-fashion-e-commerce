import divisionsData from '@/lib/data/geo/divisions.json'
import districtsData from '@/lib/data/geo/districts.json'
import thanasData from '@/lib/data/geo/thanas.json'

interface DivisionRow {
  id: string
  name_en: string
  name_bn: string
}

interface DistrictRow {
  id: string
  division_id: string
  name_en: string
  name_bn: string
}

interface ThanaRow {
  id: string
  district_id: string
  name_en: string
  name_bn: string
}

const divisions = [...(divisionsData as DivisionRow[])].sort((a, b) =>
  a.name_en.localeCompare(b.name_en),
)

const districts = districtsData as DistrictRow[]
const thanas = thanasData as ThanaRow[]

const districtsByDivisionId = districts.reduce<Record<string, DistrictRow[]>>(
  (acc, district) => {
    if (!acc[district.division_id]) acc[district.division_id] = []
    acc[district.division_id].push(district)
    return acc
  },
  {},
)

const thanasByDistrictId = thanas.reduce<Record<string, ThanaRow[]>>(
  (acc, thana) => {
    if (!acc[thana.district_id]) acc[thana.district_id] = []
    acc[thana.district_id].push(thana)
    return acc
  },
  {},
)

Object.values(districtsByDivisionId).forEach((list) =>
  list.sort((a, b) => a.name_en.localeCompare(b.name_en)),
)
Object.values(thanasByDistrictId).forEach((list) =>
  list.sort((a, b) => a.name_en.localeCompare(b.name_en)),
)

const divisionNameById = divisions.reduce<Record<string, string>>((acc, div) => {
  acc[div.id] = div.name_en
  return acc
}, {})

const districtNameById = districts.reduce<Record<string, string>>((acc, dist) => {
  acc[dist.id] = dist.name_en
  return acc
}, {})

const thanaNameById = thanas.reduce<Record<string, string>>((acc, thana) => {
  acc[thana.id] = thana.name_en
  return acc
}, {})

export function getDivisionName(id: string) {
  return divisionNameById[id] || id
}

export function getDistrictName(id: string) {
  return districtNameById[id] || id
}

export function getThanaName(id: string) {
  return thanaNameById[id] || id
}

export {
  divisions,
  districtsByDivisionId,
  thanasByDistrictId,
}
