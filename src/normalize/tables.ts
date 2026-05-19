export function normalizeTables(doc: Document): void {
  doc.querySelectorAll("table").forEach((table) => {
    table.removeAttribute("style");
    table.removeAttribute("cellpadding");
    table.removeAttribute("cellspacing");
    table.removeAttribute("border");
    table.removeAttribute("width");

    table.querySelectorAll("tr, td, th, tbody, thead, col, colgroup").forEach((el) => {
      el.removeAttribute("style");
      el.removeAttribute("width");
      el.removeAttribute("height");
      el.removeAttribute("class");
    });

    const hasThead = !!table.querySelector("thead");
    if (hasThead) return;

    const firstRow = table.querySelector("tr");
    if (!firstRow) return;

    const headerCells = Array.from(firstRow.children).filter((c) => c.tagName === "TD");
    if (headerCells.length === 0) return;

    headerCells.forEach((td) => {
      const th = doc.createElement("th");
      while (td.firstChild) th.appendChild(td.firstChild);
      for (const attr of Array.from(td.attributes)) {
        th.setAttribute(attr.name, attr.value);
      }
      td.parentNode?.replaceChild(th, td);
    });

    const thead = doc.createElement("thead");
    firstRow.parentNode?.insertBefore(thead, firstRow);
    thead.appendChild(firstRow);
  });
}
