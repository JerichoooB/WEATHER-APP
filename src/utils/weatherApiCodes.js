// WeatherAPI condition codes mapped to the WMO icon categories used in SkyCast.
const groups=[
 [0,[1000]], [2,[1003]], [3,[1006,1009]], [45,[1030,1135]], [48,[1147]],
 [51,[1072,1150,1153]], [56,[1168,1171]], [61,[1063,1180,1183,1240]],
 [63,[1186,1189,1243]], [65,[1192,1195,1246]], [66,[1198,1201]],
 [71,[1066,1069,1114,1204,1210,1213,1249,1255,1237,1261]],
 [75,[1117,1207,1216,1219,1222,1225,1252,1258,1264]],
 [95,[1087,1273,1276,1279,1282]]
];
const codes=new Map(groups.flatMap(([wmo,values])=>values.map(code=>[code,wmo])));
export const weatherApiCode = code => codes.get(code) ?? null;
