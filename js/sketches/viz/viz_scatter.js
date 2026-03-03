// viz_scatter.js
// GDP per Capita vs Happiness (scatter) using manager.data (from happiness_clean.csv)
// - Colors map to Region (meaningful)
// - Legend moved OUTSIDE plot (right side)
// - NO regression line
// - Hover tooltip for country details

(function () {
  window.VizScatter = {
    draw: function (p, manager, ai, progress) {
      const data = manager.data || [];
      const w = manager.width || 600;
      const h = manager.height || 520;
      const offsetX = manager.offsetX || 80;
      const offsetY = manager.offsetY || 0;

      // Layout padding inside the viz area
      const padL = 60;
      const padR = 220; // <-- room for legend on the right
      const padT = 55;
      const padB = 55;

      const x0 = offsetX + padL;
      const x1 = offsetX + w - padR;
      const y0 = offsetY + padT;
      const y1 = offsetY + h - padB;

      p.noStroke();

      if (!data.length) {
        p.fill(0);
        p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        p.text("Loading data...", x0, y0);
        return;
      }

      // Region -> color (meaningful categories)
      function regionColor(region) {
        const r = (region || "").toLowerCase();
        if (r.includes("western europe")) return p.color(66, 133, 244, 190);
        if (r.includes("central and eastern europe")) return p.color(120, 160, 255, 190);
        if (r.includes("north america")) return p.color(234, 67, 53, 190);
        if (r.includes("latin america")) return p.color(171, 71, 188, 190);
        if (r.includes("east asia")) return p.color(52, 168, 83, 190);
        if (r.includes("southeast asia")) return p.color(0, 170, 140, 190);
        if (r.includes("south asia")) return p.color(251, 188, 5, 200);
        if (r.includes("middle east")) return p.color(245, 130, 48, 190);
        if (r.includes("sub-saharan africa")) return p.color(140, 140, 140, 190);
        if (r.includes("commonwealth of independent states")) return p.color(160, 160, 160, 190);
        return p.color(140, 140, 140, 190);
      }

      // Clean points
      const pts = data
        .filter(d => d && d.country && Number.isFinite(+d.gdp) && Number.isFinite(+d.happiness))
        .map(d => ({
          country: d.country,
          region: d.region || "",
          gdp: +d.gdp,
          happiness: +d.happiness
        }));

      if (!pts.length) {
        p.fill(0);
        p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        p.text("No valid data points found.", x0, y0);
        return;
      }

      // Extents
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      for (const d of pts) {
        if (d.gdp < minX) minX = d.gdp;
        if (d.gdp > maxX) maxX = d.gdp;
        if (d.happiness < minY) minY = d.happiness;
        if (d.happiness > maxY) maxY = d.happiness;
      }

      // Add a little padding to extents so dots don't sit on the border
      const xPad = (maxX - minX) * 0.05 || 0.2;
      const yPad = (maxY - minY) * 0.05 || 0.2;
      minX -= xPad; maxX += xPad;
      minY -= yPad; maxY += yPad;

      // ---- Title ----
      p.fill(0);
      p.textSize(18);
      p.textAlign(p.CENTER, p.TOP);
      p.text("GDP per Capita vs Happiness Score", (x0 + x1) / 2, offsetY + 10);

      // ---- Gridlines (subtle) ----
      p.stroke(0, 30);
      const gridN = 5;
      for (let i = 1; i < gridN; i++) {
        const gx = p.lerp(x0, x1, i / gridN);
        const gy = p.lerp(y0, y1, i / gridN);
        p.line(gx, y0, gx, y1);
        p.line(x0, gy, x1, gy);
      }

      // ---- Axes ----
      p.stroke(0);
      p.line(x0, y1, x1, y1); // x-axis
      p.line(x0, y0, x0, y1); // y-axis

      // ---- Axis labels ----
      p.noStroke();
      p.fill(0);
      p.textSize(12);

      p.textAlign(p.CENTER, p.TOP);
      p.text("Log(GDP per Capita)", (x0 + x1) / 2, y1 + 18);

      p.push();
      p.translate(x0 - 45, (y0 + y1) / 2);
      p.rotate(-p.HALF_PI);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Happiness Score", 0, 0);
      p.pop();

      // ---- Points + Hover ----
      let hovered = null;

      for (const d of pts) {
        const x = p.map(d.gdp, minX, maxX, x0, x1);
        const y = p.map(d.happiness, minY, maxY, y1, y0);

        const dist = p.dist(p.mouseX, p.mouseY, x, y);
        const isHover = dist < 7;

        p.noStroke();
        p.fill(isHover ? p.color(0) : regionColor(d.region));
        p.circle(x, y, isHover ? 9 : 7);

        if (isHover) hovered = { d, x, y };
      }

      // ---- Tooltip ----
      if (hovered) {
        const d = hovered.d;
        const lines = [
          d.country,
          `Region: ${d.region || "N/A"}`,
          `Log GDP: ${d.gdp.toFixed(2)}`,
          `Happiness: ${d.happiness.toFixed(2)}`
        ];

        const boxW = 240;
        const boxH = 18 * lines.length + 14;

        let boxX = hovered.x + 14;
        let boxY = hovered.y - boxH - 12;

        // keep it on-screen
        if (boxX + boxW > x1) boxX = hovered.x - boxW - 14;
        if (boxY < y0) boxY = hovered.y + 14;

        p.noStroke();
        p.fill(0);
        p.rect(boxX, boxY, boxW, boxH, 8);

        p.fill(255);
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);

        let ty = boxY + 8;
        for (const line of lines) {
          p.text(line, boxX + 10, ty);
          ty += 18;
        }
      }

      // ---- Legend (outside plot, right side) ----
      const legendX = x1 + 25;
      const legendY = y0;

      // A stable order so the legend doesn't shuffle
      const regionOrder = [
        "Western Europe",
        "Central and Eastern Europe",
        "North America and ANZ",
        "Latin America and Caribbean",
        "East Asia",
        "Southeast Asia",
        "South Asia",
        "Middle East and North Africa",
        "Commonwealth of Independent States",
        "Sub-Saharan Africa"
      ];

      // only show regions that exist in the data
      const regionsInData = new Set(pts.map(d => d.region).filter(Boolean));
      const legendRegions = regionOrder.filter(r => {
        // match by includes since your data uses these exact labels
        for (const rr of regionsInData) {
          if ((rr || "").toLowerCase() === r.toLowerCase()) return true;
        }
        return false;
      });

      // fallback if data has unexpected region names
      if (!legendRegions.length) {
        legendRegions.push(...[...regionsInData].slice(0, 10));
      }

      p.noStroke();
      p.fill(0);
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      p.text("Region", legendX, legendY);

      let ly = legendY + 18;
      for (const r of legendRegions) {
        p.fill(regionColor(r));
        p.circle(legendX + 6, ly + 7, 8);

        p.fill(0);
        p.textAlign(p.LEFT, p.TOP);
        p.text(r, legendX + 18, ly);

        ly += 18;
      }
    }
  };
})();
