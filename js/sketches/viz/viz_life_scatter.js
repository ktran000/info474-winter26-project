// viz_life_scatter.js
// NOW: Top 15 Happiest Countries (bar chart) using manager.data (from happiness_clean.csv)

(function () {
  window.VizLifeScatter = {
    draw: function (p, manager, ai, progress) {
      const data = manager.data || [];
      const w = manager.width || 600;
      const h = manager.height || 520;
      const offsetX = manager.offsetX || 80;
      const offsetY = manager.offsetY || 0;

      // Layout padding inside the viz area
      const padL = 170; // leave room for country labels
      const padR = 30;
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

      // Helper: region -> color (keep your styling idea)
      function regionColor(region) {
        const r = (region || "").toLowerCase();
        if (r.includes("europe")) return p.color(66, 133, 244, 200);
        if (r.includes("asia")) return p.color(52, 168, 83, 200);
        if (r.includes("america")) return p.color(234, 67, 53, 200);
        if (r.includes("africa")) return p.color(251, 188, 5, 210);
        if (r.includes("oceania")) return p.color(171, 71, 188, 200);
        return p.color(140, 140, 140, 200);
      }

      // --- Build Top 15 happiest ---
      // Defensive filtering in case of missing values
      const cleaned = data
        .filter(d => d && d.country && Number.isFinite(+d.happiness))
        .map(d => ({
          country: d.country,
          happiness: +d.happiness,
          life_expectancy: Number.isFinite(+d.life_expectancy) ? +d.life_expectancy : null,
          region: d.region || ""
        }))
        .sort((a, b) => b.happiness - a.happiness)
        .slice(0, 15);

      const maxHappy = Math.max(...cleaned.map(d => d.happiness));

      // ---- Title ----
      p.fill(0);
      p.textSize(18);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Top 15 Happiest Countries", (x0 + x1) / 2, offsetY + 10);

      // ---- Axes ----
      p.stroke(0);
      p.line(x0, y1, x1, y1); // x axis
      p.noStroke();

      // x-axis label
      p.fill(0);
      p.textSize(12);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Happiness Score", (x0 + x1) / 2, y1 + 18);

      // ---- Bars ----
      const n = cleaned.length;
      const rowH = (y1 - y0) / n;
      const barH = rowH * 0.65;

      let hovered = null;

      for (let i = 0; i < n; i++) {
        const d = cleaned[i];

        const yCenter = y0 + rowH * (i + 0.5);
        const barY = yCenter - barH / 2;

        const barW = p.map(d.happiness, 0, maxHappy, 0, (x1 - x0));
        const barX = x0;

        const isHover =
          p.mouseX >= barX &&
          p.mouseX <= barX + barW &&
          p.mouseY >= barY &&
          p.mouseY <= barY + barH;

        // Country label (left side)
        p.fill(0);
        p.textSize(12);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(d.country, x0 - 10, yCenter);

        // Bar
        p.noStroke();
        p.fill(isHover ? 0 : p.color(90, 130, 220, 200)); // one consistent color
        p.rect(barX, barY, barW, barH, 6);

        // Value label (end of bar)
        p.fill(0);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(d.happiness.toFixed(2), barX + barW + 8, yCenter);

        if (isHover) hovered = { d, x: barX + barW, y: yCenter };
      }

      // ---- Tooltip on hover ----
      if (hovered) {
        const d = hovered.d;

        const lines = [
          d.country,
          `Happiness: ${d.happiness.toFixed(2)}`,
          d.life_expectancy != null ? `Life Exp: ${d.life_expectancy.toFixed(2)}` : "Life Exp: N/A",
          d.region ? `Region: ${d.region}` : ""
        ].filter(Boolean);

        const boxW = 230;
        const boxH = 18 * lines.length + 14;

        let boxX = hovered.x + 18;
        let boxY = hovered.y - boxH / 2;

        if (boxX + boxW > x1) boxX = hovered.x - boxW - 18;
        if (boxY < y0) boxY = y0;
        if (boxY + boxH > y1) boxY = y1 - boxH;

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
    }
  };
})();