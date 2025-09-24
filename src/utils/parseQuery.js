 export function parseQuery(query) {
  const parsed = {}
  for (let key in query) {
    if (key.includes("[")) {
      const [field, op] = key.replace("]", "").split("[") // "price[gte]" => ["price", "gte"]
      if (!parsed[field]) parsed[field] = {}
      parsed[field][op] = query[key]
    } else {
      parsed[key] = query[key]
    }
  }
  return parsed
}
