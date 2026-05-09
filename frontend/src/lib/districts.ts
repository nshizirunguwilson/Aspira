/** Rwanda's 30 administrative districts, grouped by province for the picker. */

export interface DistrictGroup {
  province: string;
  districts: string[];
}

export const RWANDA_DISTRICTS: DistrictGroup[] = [
  {
    province: "City of Kigali",
    districts: ["Gasabo", "Kicukiro", "Nyarugenge"],
  },
  {
    province: "Northern Province",
    districts: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
  },
  {
    province: "Southern Province",
    districts: [
      "Gisagara",
      "Huye",
      "Kamonyi",
      "Muhanga",
      "Nyamagabe",
      "Nyanza",
      "Nyaruguru",
      "Ruhango",
    ],
  },
  {
    province: "Eastern Province",
    districts: [
      "Bugesera",
      "Gatsibo",
      "Kayonza",
      "Kirehe",
      "Ngoma",
      "Nyagatare",
      "Rwamagana",
    ],
  },
  {
    province: "Western Province",
    districts: [
      "Karongi",
      "Ngororero",
      "Nyabihu",
      "Nyamasheke",
      "Rubavu",
      "Rusizi",
      "Rutsiro",
    ],
  },
];

export const ALL_DISTRICTS: string[] = RWANDA_DISTRICTS.flatMap(
  (g) => g.districts,
).sort();
