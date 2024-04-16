export const clearData = (data: any[]) => {
  return data
    .map((bucket: any) => {
      let name = bucket.key;
      // Remove leading and trailing special characters and JSON artifacts
      name = name.replace(/^\{["']?|["']?\}$/g, ""); // Remove curly braces and optional quotes at the start/end
      return {
        name: name,
        count: bucket.doc_count,
      };
    })
    .filter((investor: any) => {
      return investor.name.length !== 0;
    });
};
